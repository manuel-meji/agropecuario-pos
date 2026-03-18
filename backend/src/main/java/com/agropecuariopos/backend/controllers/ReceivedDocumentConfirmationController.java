package com.agropecuariopos.backend.controllers;

import com.agropecuariopos.backend.models.ReceivedDocument;
import com.agropecuariopos.backend.repositories.ReceivedDocumentRepository;
import com.agropecuariopos.backend.services.hacienda.HaciendaAuthClientService;
import com.agropecuariopos.backend.services.hacienda.MensajeReceptorGeneratorService;
import com.agropecuariopos.backend.services.hacienda.XadesSignatureService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

/**
 * Controlador REST para Confirmación/Rechazo de documentos electrónicos recibidos.
 * Implementa el Art. 10 de la Resolución MH-DGT-RES-0027-2024:
 * "El emisor-receptor debe confirmar en máximo 8 días hábiles del mes siguiente."
 *
 * El flujo completo para cada documento:
 *   1. Generar XML MensajeReceptor v4.4
 *   2. Firmarlo con XAdES-EPES
 *   3. Enviarlo en Base64 via POST /recepcion a Hacienda
 *   4. Guardar resultado en BD y actualizar estado
 */
@RestController
@RequestMapping("/api/received-documents")
public class ReceivedDocumentConfirmationController {

    private static final Logger logger = LoggerFactory.getLogger(ReceivedDocumentConfirmationController.class);

    @Autowired
    private ReceivedDocumentRepository receivedDocumentRepository;

    @Autowired
    private MensajeReceptorGeneratorService mensajeReceptorGenerator;

    @Autowired
    private XadesSignatureService xadesSignatureService;

    @Autowired
    private HaciendaAuthClientService authService;

    @Value("${hacienda.api.recepcion.url}")
    private String recepcionUrl;

    @Value("${hacienda.emisor.cedula}")
    private String emisorCedula;

    @Value("${hacienda.emisor.tipo.cedula}")
    private String emisorTipoCedula;

    @Value("${hacienda.crypto.keystore.path}")
    private String p12Path;

    @Value("${hacienda.crypto.keystore.password}")
    private String p12Password;

    /**
     * Aceptar Total (Mensaje = 1).
     * POST /api/received-documents/{clave}/accept
     */
    @PostMapping("/{clave}/accept")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> aceptarTotal(@PathVariable String clave, Authentication auth) {
        return procesarMensaje(clave, "ACEPTAR_TOTAL", null, null, auth);
    }

    /**
     * Aceptar Parcial (Mensaje = 2).
     * POST /api/received-documents/{clave}/accept-partial
     * Body: { "montoAceptado": 50000.00, "detalle": "Se acepta parcialmente..." }
     */
    @PostMapping("/{clave}/accept-partial")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> aceptarParcial(
            @PathVariable String clave,
            @RequestBody Map<String, Object> body,
            Authentication auth) {
        BigDecimal monto = new BigDecimal(body.getOrDefault("montoAceptado", 0).toString());
        String detalle = (String) body.getOrDefault("detalle", "Aceptación parcial");
        return procesarMensaje(clave, "ACEPTAR_PARCIAL", monto, detalle, auth);
    }

    /**
     * Rechazar (Mensaje = 3).
     * POST /api/received-documents/{clave}/reject
     * Body: { "detalle": "Motivo del rechazo (mín 5 chars)" }
     */
    @PostMapping("/{clave}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> rechazar(
            @PathVariable String clave,
            @RequestBody Map<String, Object> body,
            Authentication auth) {
        String detalle = (String) body.getOrDefault("detalle", "");
        if (detalle.trim().length() < 5) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "El detalle del rechazo debe tener al menos 5 caracteres"));
        }
        return procesarMensaje(clave, "RECHAZAR", null, detalle, auth);
    }

    // ── Lógica central ────────────────────────────────────────────────────────

    private ResponseEntity<Map<String, Object>> procesarMensaje(
            String clave, String tipo, BigDecimal monto, String detalle, Authentication auth) {

        ReceivedDocument doc = receivedDocumentRepository.findByClave(clave)
                .orElse(null);

        if (doc == null) {
            return ResponseEntity.notFound().build();
        }

        if (doc.getEstadoConfirmacion() != ReceivedDocument.EstadoConfirmacion.PENDIENTE) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "El documento ya fue confirmado: " + doc.getEstadoConfirmacion()));
        }

        try {
            // 1. Generar XML MensajeReceptor
            String xmlMensaje;
            ReceivedDocument.EstadoConfirmacion nuevoEstado;

            switch (tipo) {
                case "ACEPTAR_TOTAL":
                    xmlMensaje = mensajeReceptorGenerator.generarAceptacionTotal(doc);
                    nuevoEstado = ReceivedDocument.EstadoConfirmacion.ACEPTADO_TOTAL;
                    doc.setMensajeRespuesta(1);
                    break;
                case "ACEPTAR_PARCIAL":
                    xmlMensaje = mensajeReceptorGenerator.generarAceptacionParcial(doc, monto, detalle);
                    nuevoEstado = ReceivedDocument.EstadoConfirmacion.ACEPTADO_PARCIAL;
                    doc.setMensajeRespuesta(2);
                    doc.setMontoAceptado(monto);
                    doc.setDetalleMensaje(detalle);
                    break;
                case "RECHAZAR":
                    xmlMensaje = mensajeReceptorGenerator.generarRechazo(doc, detalle);
                    nuevoEstado = ReceivedDocument.EstadoConfirmacion.RECHAZADO;
                    doc.setMensajeRespuesta(3);
                    doc.setDetalleMensaje(detalle);
                    break;
                default:
                    return ResponseEntity.badRequest().body(Map.of("error", "Tipo inválido: " + tipo));
            }

            // 2. Firmar con XAdES-EPES
            String xmlFirmado = xadesSignatureService.signXmlDocument(xmlMensaje, p12Path, p12Password);
            doc.setXmlMensajeReceptorFirmado(xmlFirmado);

            // 3. Enviar a Hacienda
            String estadoEnvio = enviarMensajeAHacienda(doc.getClave(), xmlFirmado, doc.getFechaEmisionDoc());
            
            // 4. Actualizar estado en BD
            doc.setEstadoConfirmacion(nuevoEstado);
            doc.setFechaEnvioMensaje(LocalDateTime.now());
            doc.setEstadoEnvioMensaje(
                    "OK".equals(estadoEnvio)
                            ? ReceivedDocument.EstadoEnvio.ENVIADO
                            : ReceivedDocument.EstadoEnvio.ERROR);
            // Auditoría: guardar quién y cuándo confirmó
            if (auth != null && auth.getName() != null) {
                doc.setConfirmadoPor(auth.getName());
            }

            receivedDocumentRepository.save(doc);

            logger.info("MensajeReceptor {} enviado para clave: {}. Estado: {}", tipo, clave, estadoEnvio);

            return ResponseEntity.ok(Map.of(
                    "clave", clave,
                    "tipo", tipo,
                    "estadoConfirmacion", nuevoEstado.name(),
                    "estadoEnvio", estadoEnvio,
                    "mensaje", "Confirmación enviada exitosamente a Hacienda"
            ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error procesando MensajeReceptor para {}: {}", clave, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Envía el MensajeReceptor firmado a la API de Hacienda en base64.
     * Retorna "OK" si fue aceptado, o el mensaje de error de Hacienda.
     */
    private String enviarMensajeAHacienda(String clave, String xmlFirmado, java.time.LocalDateTime fechaEmisión) {
        try {
            String token = authService.getValidAccessToken();
            String xmlBase64 = Base64.getEncoder().encodeToString(xmlFirmado.getBytes("UTF-8"));

            String fechaFormateada = (fechaEmisión != null ? fechaEmisión : LocalDateTime.now())
                    .atOffset(java.time.ZoneOffset.of("-06:00"))
                    .format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ssXXX"));

            Map<String, Object> body = new HashMap<>();
            body.put("clave", clave);
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
            RestTemplate rt = new RestTemplate();
            ResponseEntity<String> response = rt.postForEntity(recepcionUrl, request, String.class);

            if (response.getStatusCode() == HttpStatus.ACCEPTED || response.getStatusCode().is2xxSuccessful()) {
                return "OK";
            }
            return "HTTP_" + response.getStatusCode();

        } catch (Exception e) {
            logger.warn("Error enviando MensajeReceptor a Hacienda: {}", e.getMessage());
            return "ERROR: " + e.getMessage();
        }
    }
}
