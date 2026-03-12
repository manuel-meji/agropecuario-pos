package com.agropecuariopos.backend.services.hacienda;

import com.agropecuariopos.backend.models.ElectronicInvoice;
import com.agropecuariopos.backend.repositories.ElectronicInvoiceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Servicio de comunicación bidireccional con la API REST de Hacienda CR.
 * Maneja el envío del XML firmado y el polling del estado del comprobante.
 * REQUIRES_NEW garantiza que un fallo en Hacienda no contamine la tx del comprobante.
 */
@Service
public class HaciendaSubmissionService {

    private static final Logger logger = LoggerFactory.getLogger(HaciendaSubmissionService.class);

    @Value("${hacienda.api.recepcion.url}")
    private String recepcionUrl;

    @Value("${hacienda.emisor.cedula}")
    private String emisorCedula;

    @Value("${hacienda.emisor.tipo.cedula}")
    private String emisorTipoCedula;

    @Autowired
    private HaciendaAuthClientService authService;

    @Autowired
    private ElectronicInvoiceRepository invoiceRepository;

    @Autowired
    private com.agropecuariopos.backend.services.email.InvoiceEmailService emailService;

    /**
     * Envía el comprobante firmado a la API de Hacienda.
     * REQUIRES_NEW: si Hacienda falla, el comprobante queda en BD igual (estado ERROR_ENVIO).
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void enviarComprobante(ElectronicInvoice invoice) {
        try {
            String token = authService.getValidAccessToken();
            String xmlBase64 = Base64.getEncoder().encodeToString(
                    invoice.getXmlFirmadoBase64().getBytes("UTF-8")
            );

            // Formatear fecha en ISO 8601 con zona horaria (-06:00 Costa Rica)
            String fechaFormateada = invoice.getCreatedAt()
                    .atOffset(java.time.ZoneOffset.of("-06:00"))
                    .format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ssXXX"));

            // Body requerido por Hacienda
            Map<String, Object> body = new HashMap<>();
            body.put("clave", invoice.getClave());
            body.put("fecha", fechaFormateada);
            body.put("emisor", Map.of(
                    "tipoIdentificacion", emisorTipoCedula,
                    "numeroIdentificacion", emisorCedula
            ));
            body.put("comprobanteXml", xmlBase64);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(token);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            RestTemplate restTemplate = new RestTemplate();

            ResponseEntity<String> response = restTemplate.postForEntity(recepcionUrl, request, String.class);

            if (response.getStatusCode() == HttpStatus.ACCEPTED || response.getStatusCode().is2xxSuccessful()) {
                invoice.setEstado(ElectronicInvoice.EstadoComprobante.ENVIADO);
                invoice.setFechaEnvio(LocalDateTime.now());
                logger.info("Comprobante {} enviado exitosamente a Hacienda. Estado: {}", invoice.getClave(), response.getStatusCode());
            } else {
                invoice.setEstado(ElectronicInvoice.EstadoComprobante.ERROR_ENVIO);
                invoice.setMensajeRespuesta("HTTP " + response.getStatusCode() + ": " + response.getBody());
                logger.warn("Respuesta inesperada de Hacienda: {}", response.getStatusCode());
            }

            invoice.setIntentosEnvio(invoice.getIntentosEnvio() + 1);
            invoiceRepository.save(invoice);

        } catch (HttpClientErrorException e) {
            logger.error("Error HTTP enviando comprobante a Hacienda: {} - Body: {}", e.getStatusCode(), e.getResponseBodyAsString());
            invoice.setEstado(ElectronicInvoice.EstadoComprobante.ERROR_ENVIO);
            invoice.setMensajeRespuesta("Error " + e.getStatusCode() + ": " + e.getResponseBodyAsString());
            invoice.setIntentosEnvio(invoice.getIntentosEnvio() + 1);
            invoiceRepository.save(invoice);
            throw new RuntimeException("Hacienda rechazó el comprobante: " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            logger.error("Error enviando comprobante {} a Hacienda: {}", invoice.getClave(), e.getMessage());
            invoice.setEstado(ElectronicInvoice.EstadoComprobante.ERROR_ENVIO);
            invoice.setMensajeRespuesta(e.getMessage());
            invoice.setIntentosEnvio(invoice.getIntentosEnvio() + 1);
            invoiceRepository.save(invoice);
            throw new RuntimeException("Fallo de comunicación con Hacienda", e);
        }
    }

    /**
     * Consulta el estado de un comprobante enviado.
     * Hacienda puede tardar segundos o minutos en procesar.
     */
    @Transactional
    public void consultarEstado(ElectronicInvoice invoice) {
        try {
            String token = authService.getValidAccessToken();
            String url = recepcionUrl + "/" + invoice.getClave();

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            HttpEntity<Void> request = new HttpEntity<>(headers);

            RestTemplate restTemplate = new RestTemplate();
            @SuppressWarnings("unchecked")
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url, HttpMethod.GET, request,
                    (Class<Map<String, Object>>) (Class<?>) Map.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                String estadoHacienda = (String) body.get("ind-estado");
                String xmlRespuesta = (String) body.get("respuesta-xml");

                invoice.setFechaRespuesta(LocalDateTime.now());
                invoice.setXmlRespuestaHacienda(xmlRespuesta);

                if ("aceptado".equalsIgnoreCase(estadoHacienda)) {
                    invoice.setEstado(ElectronicInvoice.EstadoComprobante.ACEPTADO);
                    invoice.setMensajeRespuesta("Aceptado por Hacienda");
                    logger.info("✅ Comprobante {} ACEPTADO por Hacienda", invoice.getClave());
                    
                    // Enviar factura por email al cliente mediante el servicio dedicado
                    if (emailService != null) {
                        try {
                            // Cargar la relación explícitamente con FETCH JOIN debido al procesamiento fuera de proxy
                            ElectronicInvoice invoiceWithRelations = invoiceRepository.findByIdWithRelations(invoice.getId()).orElse(invoice);
                            
                            // Asegurarnos de que el nuevo XML de Respuesta se asigne al objeto (ya que aún no se ha hecho commit en BD)
                            invoiceWithRelations.setXmlRespuestaHacienda(invoice.getXmlRespuestaHacienda());
                            invoiceWithRelations.setXmlFirmadoBase64(invoice.getXmlFirmadoBase64());
                            
                            if (invoiceWithRelations.getSale() != null) {
                                if (invoiceWithRelations.getSale().getClient() != null) {
                                    String clientEmail = invoiceWithRelations.getSale().getClient().getEmail();
                                    String clientName = invoiceWithRelations.getSale().getClient().getName();
                                    
                                    logger.info("Preparando envío de email. Cliente: {}, Correo: {}", clientName, clientEmail);
                                    emailService.sendInvoiceEmail(invoiceWithRelations, clientName, clientEmail);
                                } else {
                                    logger.warn("El comprobante {} tiene una venta asociada pero SIN cliente registrado. No se puede enviar correo.", invoice.getClave());
                                }
                            } else {
                                logger.warn("El comprobante {} NO tiene una venta asociada. No se puede enviar correo.", invoice.getClave());
                            }
                        } catch (Exception e) {
                            logger.error("Error crítico intentando enviar correo electrónico: ", e);
                        }
                    }
                } else if ("rechazado".equalsIgnoreCase(estadoHacienda)) {
                    invoice.setEstado(ElectronicInvoice.EstadoComprobante.RECHAZADO);
                    String detalle = body.getOrDefault("detalle", "Sin detalle").toString();
                    invoice.setMensajeRespuesta("RECHAZADO: " + detalle);

                    // Log completo del body de Hacienda para diagnóstico
                    logger.warn("❌ Comprobante {} RECHAZADO. Campos respuesta: {}", invoice.getClave(), body.keySet());
                    logger.warn("❌ Detalle rechazo: {}", detalle);

                    // Decodificar respuesta-xml (viene en base64) para ver el motivo real
                    if (xmlRespuesta != null && !xmlRespuesta.isBlank()) {
                        try {
                            String xmlDecodificado = new String(Base64.getDecoder().decode(xmlRespuesta), "UTF-8");
                            logger.warn("❌ XML respuesta Hacienda (decodificado):\n{}", xmlDecodificado);
                        } catch (Exception decodeEx) {
                            // Si no es base64 puro, loguear tal cual
                            logger.warn("❌ XML respuesta Hacienda (raw): {}", xmlRespuesta);
                        }
                    } else {
                        logger.warn("❌ Hacienda NO devolvió xml respuesta. Body completo: {}", body);
                    }
                } else {
                    // procesando — mantener como ENVIADO para próximo ciclo
                    logger.info("⏳ Comprobante {} aún en procesamiento...", invoice.getClave());
                }

                invoiceRepository.save(invoice);
            }

        } catch (HttpClientErrorException.NotFound e) {
            // Hacienda aún no tiene el comprobante (en cola de procesamiento)
            logger.debug("Comprobante {} no encontrado aún en Hacienda (normal si es reciente)", invoice.getClave());
        } catch (Exception e) {
            logger.warn("Error consultando estado de {}: {}", invoice.getClave(), e.getMessage());
        }
    }

    /**
     * Daemon que consulta el estado de comprobantes enviados pero no resueltos.
     * Corre cada 2 minutos automáticamente.
     */
    @Scheduled(fixedDelay = 120000)
    public void pollingDaemon() {
        List<ElectronicInvoice> pendientes = invoiceRepository.findPendingStatusCheck();
        if (!pendientes.isEmpty()) {
            logger.info("Polling Hacienda: {} comprobantes en espera de respuesta", pendientes.size());
            pendientes.forEach(this::consultarEstado);
        }
    }
}
