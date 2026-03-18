package com.agropecuariopos.backend.controllers;

import com.agropecuariopos.backend.models.ReceivedDocument;
import com.agropecuariopos.backend.repositories.ReceivedDocumentRepository;
import com.agropecuariopos.backend.services.hacienda.HaciendaRecepcionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

/**
 * Controlador REST para el módulo de Documentos Recibidos (Art. 7, Resolución 0027-2024).
 * Permite listar, descargar y exportar documentos recibidos de proveedores.
 */
@RestController
@RequestMapping("/api/received-documents")
public class ReceivedDocumentController {

    private static final Logger logger = LoggerFactory.getLogger(ReceivedDocumentController.class);

    @Autowired
    private ReceivedDocumentRepository receivedDocumentRepository;

    @Autowired
    private HaciendaRecepcionService recepcionService;

    /**
     * Importa un comprobante directamente por su clave de 50 dígitos.
     * Valida formato, consulta Hacienda y guarda en BD. Idempotente (no duplica).
     * POST /api/received-documents/import-clave
     * Body: { "clave": "50 dígitos" }
     */
    @PostMapping("/import-clave")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CASHIER')")
    public ResponseEntity<Map<String, Object>> importarPorClave(@RequestBody Map<String, String> body) {
        String clave = body.getOrDefault("clave", "").trim();

        // Validación robusta de clave de 50 dígitos
        if (!clave.matches("\\d{50}")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "La clave debe tener exactamente 50 dígitos numéricos"));
        }

        try {
            Map<String, Object> resultado = recepcionService.importarPorClave(clave);
            return ResponseEntity.ok(resultado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error importando clave {}: {}", clave, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Importa un comprobante desde un archivo XML (o ZIP que contenga un XML).
     * Extrae la <Clave> del XML, descarga el comprobante desde Hacienda y lo guarda.
     * POST /api/received-documents/import-xml   (multipart/form-data, field: "file")
     */
    @PostMapping(value = "/import-xml", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN') or hasRole('CASHIER')")
    public ResponseEntity<Map<String, Object>> importarDesdeXml(
            @RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El archivo está vacío"));
        }

        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";

        try {
            String xmlContenido;

            if (filename.endsWith(".zip")) {
                // Extraer el primer XML del ZIP
                xmlContenido = null;
                try (ZipInputStream zis = new ZipInputStream(new ByteArrayInputStream(file.getBytes()))) {
                    ZipEntry entry;
                    while ((entry = zis.getNextEntry()) != null) {
                        if (entry.getName().toLowerCase().endsWith(".xml")) {
                            xmlContenido = new String(zis.readAllBytes(), StandardCharsets.UTF_8);
                            break;
                        }
                    }
                }
                if (xmlContenido == null) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "El ZIP no contiene ningún archivo XML"));
                }
            } else if (filename.endsWith(".xml")) {
                xmlContenido = new String(file.getBytes(), StandardCharsets.UTF_8);
            } else {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Formato no soportado. Suba un archivo .xml o .zip"));
            }

            Map<String, Object> resultado = recepcionService.importarDesdeXml(xmlContenido);
            return ResponseEntity.ok(resultado);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error importando XML: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Lista todos los documentos recibidos, con filtros opcionales.
     * GET /api/received-documents
     * GET /api/received-documents?estado=PENDIENTE
     * GET /api/received-documents?desde=2025-03-01&hasta=2025-03-31
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('CASHIER')")
    public ResponseEntity<List<Map<String, Object>>> listar(
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta
    ) {
        List<ReceivedDocument> docs;

        if (estado != null && !estado.isBlank()) {
            try {
                ReceivedDocument.EstadoConfirmacion estadoEnum =
                        ReceivedDocument.EstadoConfirmacion.valueOf(estado.toUpperCase());
                docs = receivedDocumentRepository.findByEstadoConfirmacion(estadoEnum);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }
        } else if (desde != null && hasta != null) {
            docs = receivedDocumentRepository.findByFechaEmisionDocBetweenOrderByFechaEmisionDocDesc(
                    desde.atStartOfDay(), hasta.plusDays(1).atStartOfDay());
        } else {
            docs = receivedDocumentRepository.findAllOrderByFechaDesc();
        }

        List<Map<String, Object>> result = docs.stream()
                .map(this::toSummaryMap)
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    /**
     * Detalle de un documento específico por clave.
     * GET /api/received-documents/{clave}
     */
    @GetMapping("/{clave}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CASHIER')")
    public ResponseEntity<Map<String, Object>> detalle(@PathVariable String clave) {
        return receivedDocumentRepository.findByClave(clave)
                .map(doc -> ResponseEntity.ok(toDetailMap(doc)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Descarga el XML original del documento recibido.
     * GET /api/received-documents/{clave}/download-xml
     */
    @GetMapping("/{clave}/download-xml")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CASHIER')")
    public ResponseEntity<byte[]> descargarXml(@PathVariable String clave) {
        return receivedDocumentRepository.findByClave(clave)
                .filter(doc -> doc.getXmlRecibido() != null)
                .map(doc -> {
                    byte[] xmlBytes = doc.getXmlRecibido().getBytes(StandardCharsets.UTF_8);
                    HttpHeaders headers = new HttpHeaders();
                    headers.setContentType(MediaType.APPLICATION_XML);
                    headers.setContentDispositionFormData("attachment",
                            "Recibido_" + clave + ".xml");
                    return ResponseEntity.ok().headers(headers).body(xmlBytes);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Sincronización manual: descarga y guarda un comprobante específico desde Hacienda.
     * POST /api/received-documents/{clave}/sync
     */
    @PostMapping("/{clave}/sync")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> sincronizarUno(@PathVariable String clave) {
        try {
            ReceivedDocument doc = recepcionService.descargarComprobante(clave);
            return ResponseEntity.ok(toSummaryMap(doc));
        } catch (Exception e) {
            logger.error("Error sincronizando comprobante {}: {}", clave, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Dispara la sincronización manual de todos los documentos recibidos con Hacienda.
     * POST /api/received-documents/sync-all
     */
    @PostMapping("/sync-all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> sincronizarTodos() {
        try {
            recepcionService.sincronizarDocumentosRecibidos();
            long total = receivedDocumentRepository.count();
            return ResponseEntity.ok(Map.of("mensaje", "Sincronización iniciada", "totalGuardados", total));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Exportación masiva de todos los documentos en un ZIP (Art. 7 §4).
     * GET /api/received-documents/export-zip?desde=2025-01-01&hasta=2025-03-31
     */
    @GetMapping("/export-zip")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> exportarZip(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta
    ) {
        try {
            List<ReceivedDocument> docs;
            if (desde != null && hasta != null) {
                docs = receivedDocumentRepository.findByFechaEmisionDocBetweenOrderByFechaEmisionDocDesc(
                        desde.atStartOfDay(), hasta.plusDays(1).atStartOfDay());
            } else {
                docs = receivedDocumentRepository.findAllOrderByFechaDesc();
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            try (ZipOutputStream zos = new ZipOutputStream(baos)) {
                for (ReceivedDocument doc : docs) {
                    String baseName = "recibidos/" + doc.getClave();

                    // XML recibido
                    if (doc.getXmlRecibido() != null && !doc.getXmlRecibido().isBlank()) {
                        addZipEntry(zos, baseName + ".xml",
                                doc.getXmlRecibido().getBytes(StandardCharsets.UTF_8));
                    }

                    // XML MensajeReceptor firmado (si ya se envió confirmación)
                    if (doc.getXmlMensajeReceptorFirmado() != null
                            && !doc.getXmlMensajeReceptorFirmado().isBlank()) {
                        addZipEntry(zos, baseName + "_mensaje_receptor.xml",
                                doc.getXmlMensajeReceptorFirmado().getBytes(StandardCharsets.UTF_8));
                    }

                    // Respuesta de Hacienda al MensajeReceptor
                    if (doc.getXmlRespuestaHacienda() != null
                            && !doc.getXmlRespuestaHacienda().isBlank()) {
                        addZipEntry(zos, baseName + "_respuesta_hacienda.xml",
                                doc.getXmlRespuestaHacienda().getBytes(StandardCharsets.UTF_8));
                    }
                }
            }

            String nombreArchivo = "DocumentosRecibidos"
                    + (desde != null ? "_" + desde : "")
                    + (hasta != null ? "_al_" + hasta : "")
                    + ".zip";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", nombreArchivo);

            logger.info("Exportación ZIP de {} documentos recibidos generada", docs.size());
            return ResponseEntity.ok().headers(headers).body(baos.toByteArray());

        } catch (Exception e) {
            logger.error("Error generando ZIP de documentos recibidos: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Cuenta de documentos pendientes de confirmación (para alertas en dashboard).
     * GET /api/received-documents/pending-count
     */
    @GetMapping("/pending-count")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CASHIER')")
    public ResponseEntity<Map<String, Object>> pendingCount() {
        long pendientes = receivedDocumentRepository
                .findByEstadoConfirmacion(ReceivedDocument.EstadoConfirmacion.PENDIENTE).size();
        return ResponseEntity.ok(Map.of("pendientes", pendientes));
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private void addZipEntry(ZipOutputStream zos, String name, byte[] data) throws Exception {
        zos.putNextEntry(new ZipEntry(name));
        zos.write(data);
        zos.closeEntry();
    }

    private Map<String, Object> toSummaryMap(ReceivedDocument doc) {
        return Map.of(
                "id", doc.getId(),
                "clave", doc.getClave(),
                "cedulaEmisor", doc.getCedulaEmisor() != null ? doc.getCedulaEmisor() : "",
                "nombreEmisor", doc.getNombreEmisor() != null ? doc.getNombreEmisor() : "",
                "fechaEmisionDoc", doc.getFechaEmisionDoc() != null ? doc.getFechaEmisionDoc().toString() : "",
                "montoTotal", doc.getMontoTotal() != null ? doc.getMontoTotal() : 0,
                "codigoMoneda", doc.getCodigoMoneda() != null ? doc.getCodigoMoneda() : "CRC",
                "estadoConfirmacion", doc.getEstadoConfirmacion().name(),
                "tieneXml", doc.getXmlRecibido() != null && !doc.getXmlRecibido().isBlank()
        );
    }

    private Map<String, Object> toDetailMap(ReceivedDocument doc) {
        return Map.of(
                "id", doc.getId(),
                "clave", doc.getClave(),
                "numeroConsecutivo", doc.getNumeroConsecutivo() != null ? doc.getNumeroConsecutivo() : "",
                "cedulaEmisor", doc.getCedulaEmisor() != null ? doc.getCedulaEmisor() : "",
                "nombreEmisor", doc.getNombreEmisor() != null ? doc.getNombreEmisor() : "",
                "emailEmisor", doc.getEmailEmisor() != null ? doc.getEmailEmisor() : "",
                "fechaEmisionDoc", doc.getFechaEmisionDoc() != null ? doc.getFechaEmisionDoc().toString() : "",
                "montoTotal", doc.getMontoTotal() != null ? doc.getMontoTotal() : 0,
                "estadoConfirmacion", doc.getEstadoConfirmacion().name(),
                "mensajeRespuesta", doc.getMensajeRespuesta() != null ? doc.getMensajeRespuesta() : 0
        );
    }
}
