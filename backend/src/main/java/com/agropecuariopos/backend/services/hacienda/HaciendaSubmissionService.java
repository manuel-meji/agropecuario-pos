package com.agropecuariopos.backend.services.hacienda;

import com.agropecuariopos.backend.models.CompanySettings;
import com.agropecuariopos.backend.models.ElectronicInvoice;
import com.agropecuariopos.backend.repositories.CompanySettingsRepository;
import com.agropecuariopos.backend.repositories.ElectronicInvoiceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
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

    @Autowired
    private CompanySettingsRepository settingsRepository;

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
    @Transactional(propagation = Propagation.REQUIRES_NEW, noRollbackFor = Exception.class)
    public void enviarComprobante(ElectronicInvoice invoice) {
        CompanySettings settings = settingsRepository.findFirst()
                .orElseThrow(() -> new RuntimeException("No se encontró la configuración de la empresa."));

        try {
            String token = authService.getValidAccessToken();
            if (token != null) token = token.trim();
            logger.info("🔑 Token obtenido (longitud: {}). Destino: {}", 
                    token != null ? token.length() : 0, settings.getHaciendaRecepcionUrl());
            
            // Si el XML firmado es nulo o vacío por alguna razón, no podemos enviarlo
            if (invoice.getXmlFirmadoBase64() == null || invoice.getXmlFirmadoBase64().isBlank()) {
                throw new RuntimeException("El XML firmado está vacío. No se puede enviar a Hacienda.");
            }

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
                    "tipoIdentificacion", settings.getLegalId().length() > 10 ? "02" : "01", // Simplificación o usar campo específico
                    "numeroIdentificacion", settings.getLegalId()
            ));
            body.put("comprobanteXml", xmlBase64);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            // Construcción manual del header para evitar problemas de compatibilidad en el WAF de Hacienda
            headers.set("Authorization", "Bearer " + token.trim());

            @SuppressWarnings("null")
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            
            // Configurar RestTemplate con timeouts
            org.springframework.http.client.SimpleClientHttpRequestFactory factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
            factory.setConnectTimeout(10000); // 10s
            factory.setReadTimeout(15000);    // 15s
            RestTemplate restTemplate = new RestTemplate(factory);

            String url = settings.getHaciendaRecepcionUrl();
            if (url == null) throw new RuntimeException("URL de recepción de Hacienda no configurada.");
            
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            if (response.getStatusCode() == HttpStatus.ACCEPTED || response.getStatusCode().is2xxSuccessful()) {
                invoice.setEstado(ElectronicInvoice.EstadoComprobante.ENVIADO);
                invoice.setFechaEnvio(LocalDateTime.now());
                logger.info("✅ Comprobante {} enviado exitosamente a Hacienda. Estado: {}", invoice.getClave(), response.getStatusCode());
                invoice.setMensajeRespuesta("Enviado exitosamente: " + response.getStatusCode());
            } else {
                invoice.setEstado(ElectronicInvoice.EstadoComprobante.ERROR_ENVIO);
                invoice.setMensajeRespuesta("HTTP " + response.getStatusCode() + ": " + response.getBody());
                logger.warn("⚠️ Respuesta inesperada de Hacienda para {}: {}", invoice.getClave(), response.getStatusCode());
            }

            invoice.setIntentosEnvio(invoice.getIntentosEnvio() + 1);
            invoiceRepository.save(invoice);

        } catch (HttpClientErrorException e) {
            logger.error("❌ Error HTTP ({}) enviando comprobante {}: {}", e.getStatusCode(), invoice.getClave(), e.getResponseBodyAsString());
            
            // Si es 401 o 403, invalidamos el token actual para forzar uno nuevo en el siguiente intento
            if (e.getStatusCode() == HttpStatus.UNAUTHORIZED || e.getStatusCode() == HttpStatus.FORBIDDEN) {
                authService.invalidateToken();
            }
            
            invoice.setEstado(ElectronicInvoice.EstadoComprobante.ERROR_ENVIO);
            invoice.setMensajeRespuesta("Error " + e.getStatusCode() + ": " + e.getResponseBodyAsString());
            invoice.setIntentosEnvio(invoice.getIntentosEnvio() + 1);
            invoiceRepository.save(invoice);
            throw new RuntimeException("Hacienda rechazó el comprobante (" + e.getStatusCode() + "): " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            logger.error("❌ Error de comunicación enviando comprobante {}: {} - Causa: {}", 
                    invoice.getClave(), e.getMessage(), 
                    e.getCause() != null ? e.getCause().getMessage() : "N/A", e);
            
            invoice.setEstado(ElectronicInvoice.EstadoComprobante.ERROR_ENVIO);
            invoice.setMensajeRespuesta("Error de comunicación: " + e.getMessage());
            invoice.setIntentosEnvio(invoice.getIntentosEnvio() + 1);
            invoiceRepository.save(invoice);
            
            throw new RuntimeException("Fallo de comunicación con Hacienda: " + e.getMessage(), e);
        }
    }

    /**
     * Consulta el estado de un comprobante enviado.
     * Hacienda puede tardar segundos o minutos en procesar.
     */
    @Transactional
    public void consultarEstado(ElectronicInvoice invoice) {
        CompanySettings settings = settingsRepository.findFirst()
                .orElseThrow(() -> new RuntimeException("No se encontró la configuración de la empresa."));
        try {
            String token = authService.getValidAccessToken();
            String url = settings.getHaciendaRecepcionUrl() + "/" + invoice.getClave();

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            @SuppressWarnings("null")
            HttpEntity<Void> request = new HttpEntity<>(headers);

            // Configurar RestTemplate con timeouts
            org.springframework.http.client.SimpleClientHttpRequestFactory factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
            factory.setConnectTimeout(8000); // 8s
            factory.setReadTimeout(10000);   // 10s
            RestTemplate restTemplate = new RestTemplate(factory);

            @SuppressWarnings({"unchecked", "null"})
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url, HttpMethod.GET, request,
                    (Class<Map<String, Object>>) (Class<?>) Map.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                @SuppressWarnings("null")
                String estadoHacienda = (String) body.get("ind-estado");
                @SuppressWarnings("null")
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
    @Scheduled(fixedDelay = 60000) // Cada 1 minuto para mayor fluidez en prod
    public void pollingDaemon() {
        List<ElectronicInvoice> pendientes = invoiceRepository.findPendingStatusCheck();
        if (!pendientes.isEmpty()) {
            logger.info("🔄 Polling Hacienda: procesando {} comprobantes pendientes/enviados", pendientes.size());
            for (ElectronicInvoice inv : pendientes) {
                try {
                    if (inv.getEstado() == ElectronicInvoice.EstadoComprobante.PENDIENTE 
                        || inv.getEstado() == ElectronicInvoice.EstadoComprobante.ERROR_ENVIO) {
                        logger.info("🚀 Re-intentando envío inicial para comprobante {}", inv.getClave());
                        this.enviarComprobante(inv);
                    } else if (inv.getEstado() == ElectronicInvoice.EstadoComprobante.ENVIADO) {
                        this.consultarEstado(inv);
                    }
                } catch (Exception e) {
                    logger.warn("⚠️ Fallo en ciclo de polling para {}: {}", inv.getClave(), e.getMessage());
                }
            }
        }
    }
}
