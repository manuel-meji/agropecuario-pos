package com.agropecuariopos.backend.controllers;

import com.agropecuariopos.backend.models.ElectronicInvoice;
import com.agropecuariopos.backend.models.InvoiceConsecutive;
import com.agropecuariopos.backend.models.Sale;
import com.agropecuariopos.backend.repositories.ElectronicInvoiceRepository;
import com.agropecuariopos.backend.repositories.InvoiceConsecutiveRepository;
import com.agropecuariopos.backend.repositories.SaleRepository;
import com.agropecuariopos.backend.services.hacienda.HaciendaInvoiceService;
import com.agropecuariopos.backend.services.hacienda.HaciendaSubmissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

/**
 * Controlador REST para gestión de comprobantes electrónicos.
 */
@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    @Autowired
    private HaciendaInvoiceService haciendaInvoiceService;

    @Autowired
    private HaciendaSubmissionService haciendaSubmissionService;

    @Autowired
    private ElectronicInvoiceRepository invoiceRepository;

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private InvoiceConsecutiveRepository consecutiveRepository;

    /**
     * Emite el comprobante electrónico de una venta.
     * Útil para emitir manualmente si la emisión automática falló.
     * POST /api/invoices/{saleId}/emit
     */
    @PostMapping("/{saleId}/emit")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CASHIER')")
    public ResponseEntity<?> emitirFactura(@PathVariable @org.springframework.lang.NonNull Long saleId) {
        Sale sale = saleRepository.findById(saleId)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada: " + saleId));

        ElectronicInvoice invoice = haciendaInvoiceService.emitirComprobante(sale);

        return ResponseEntity.ok(Map.of(
                "clave", invoice.getClave(),
                "numeroConsecutivo", invoice.getNumeroConsecutivo(),
                "tipo", invoice.getTipoComprobante(),
                "estado", invoice.getEstado(),
                "mensaje", invoice.getMensajeRespuesta() != null ? invoice.getMensajeRespuesta() : "Enviado"
        ));
    }

    /**
     * Consulta el estado de un comprobante por clave de 50 dígitos.
     * GET /api/invoices/status/{clave}
     */
    @GetMapping("/status/{clave}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CASHIER')")
    public ResponseEntity<?> consultarEstado(@PathVariable String clave) {
        Optional<ElectronicInvoice> invoiceOpt = invoiceRepository.findByClave(clave);

        if (invoiceOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        ElectronicInvoice invoice = invoiceOpt.get();

        // Si está ENVIADO, consultar a Hacienda por si ya respondió
        if (invoice.getEstado() == ElectronicInvoice.EstadoComprobante.ENVIADO) {
            haciendaSubmissionService.consultarEstado(invoice);
            invoice = invoiceRepository.findByClave(clave).orElse(invoice);
        }

        return ResponseEntity.ok(Map.of(
                "clave", invoice.getClave(),
                "tipo", invoice.getTipoComprobante(),
                "estado", invoice.getEstado(),
                "fechaEnvio", invoice.getFechaEnvio() != null ? invoice.getFechaEnvio().toString() : "N/A",
                "fechaRespuesta", invoice.getFechaRespuesta() != null ? invoice.getFechaRespuesta().toString() : "Pendiente",
                "mensaje", invoice.getMensajeRespuesta() != null ? invoice.getMensajeRespuesta() : ""
        ));
    }

    /**
     * Consulta el comprobante de una venta específica.
     * GET /api/invoices/sale/{saleId}
     */
    @GetMapping("/sale/{saleId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CASHIER')")
    public ResponseEntity<?> getInvoiceBySale(@PathVariable Long saleId) {
        return invoiceRepository.findBySaleId(saleId).stream()
                .filter(inv -> inv.getTipoComprobante() == ElectronicInvoice.TipoComprobante.FACTURA_ELECTRONICA || inv.getTipoComprobante() == ElectronicInvoice.TipoComprobante.TIQUETE_ELECTRONICO)
                .findFirst()
                .map(invoice -> ResponseEntity.ok(Map.of(
                        "clave", invoice.getClave(),
                        "numeroConsecutivo", invoice.getNumeroConsecutivo(),
                        "tipo", invoice.getTipoComprobante(),
                        "estado", invoice.getEstado(),
                        "fechaEnvio", invoice.getFechaEnvio() != null ? invoice.getFechaEnvio().toString() : "N/A",
                        "mensaje", invoice.getMensajeRespuesta() != null ? invoice.getMensajeRespuesta() : ""
                )))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Reenvío manual de un comprobante fallido.
     * POST /api/invoices/{invoiceId}/resend
     */
    @PostMapping("/{invoiceId}/resend")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> reenviarComprobante(@PathVariable Long invoiceId) {
        ElectronicInvoice invoice = haciendaInvoiceService.reenviarComprobante(invoiceId);
        return ResponseEntity.ok(Map.of(
                "clave", invoice.getClave(),
                "estado", invoice.getEstado(),
                "intentos", invoice.getIntentosEnvio()
        ));
    }

    /**
     * Emite una Nota de Crédito para anular una factura/tiquete de una venta.
     * POST /api/invoices/sale/{saleId}/credit-note
     */
    @PostMapping("/sale/{saleId}/credit-note")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CASHIER')")
    public ResponseEntity<?> emitirNotaCredito(@PathVariable @org.springframework.lang.NonNull Long saleId, @RequestBody(required = false) Map<String, String> payload) {
        Sale sale = saleRepository.findById(saleId)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada: " + saleId));

        String razon = (payload != null && payload.containsKey("razon")) ? payload.get("razon") : "Anulación de comprobante";
        
        ElectronicInvoice nc = haciendaInvoiceService.emitirNotaCredito(sale, razon);

        return ResponseEntity.ok(Map.of(
                "clave", nc.getClave(),
                "numeroConsecutivo", nc.getNumeroConsecutivo(),
                "tipo", nc.getTipoComprobante(),
                "estado", nc.getEstado(),
                "mensaje", "Nota de Crédito emitida correctamente"
        ));
    }

    /**
     * Consulta el número consecutivo actual para un tipo de documento
     * GET /api/invoices/consecutives/{tipoDocumento}
     */
    @GetMapping("/consecutives/{tipoDocumento}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getConsecutive(@PathVariable String tipoDocumento) {
        return consecutiveRepository.findByTipoDocumento(tipoDocumento)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Actualiza el último número consecutivo para un tipo de documento
     * PUT /api/invoices/consecutives/{tipoDocumento}
     */
    @PutMapping("/consecutives/{tipoDocumento}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateConsecutive(@PathVariable String tipoDocumento, @RequestBody Map<String, Long> payload) {
        Long newValue = payload.get("ultimoConsecutivo");
        if (newValue == null || newValue < 0) {
            return ResponseEntity.badRequest().body("invalid ultimoConsecutivo value");
        }
        
        InvoiceConsecutive consecutive = consecutiveRepository.findByTipoDocumento(tipoDocumento)
                .orElseGet(() -> {
                    InvoiceConsecutive nuevo = new InvoiceConsecutive();
                    nuevo.setTipoDocumento(tipoDocumento);
                    nuevo.setSucursal("001");
                    nuevo.setPuntoVenta("00001");
                    return nuevo;
                });

        consecutive.setUltimoConsecutivo(newValue);
        consecutiveRepository.save(consecutive);
        
        return ResponseEntity.ok(consecutive);
    }

    /**
     * Exportación masiva de todos los documentos emitidos en un ZIP.
     * GET /api/invoices/export-zip?desde=2025-01-01&hasta=2025-03-31
     */
    @GetMapping("/export-zip")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CASHIER')")
    public ResponseEntity<byte[]> exportarZip(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta
    ) {
        try {
            List<ElectronicInvoice> docs;
            if (desde != null && hasta != null) {
                docs = invoiceRepository.findByCreatedAtBetweenOrderByCreatedAtDesc(
                        desde.atStartOfDay(), hasta.plusDays(1).atStartOfDay());
            } else {
                docs = invoiceRepository.findAllOrderByCreatedAtDesc();
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            try (ZipOutputStream zos = new ZipOutputStream(baos)) {
                for (ElectronicInvoice doc : docs) {
                    String baseName = "emitidos/" + doc.getClave();

                    // XML Generado
                    if (doc.getXmlGenerado() != null && !doc.getXmlGenerado().isBlank()) {
                        addZipEntry(zos, baseName + "_generado.xml",
                                doc.getXmlGenerado().getBytes(StandardCharsets.UTF_8));
                    }

                    // XML Firmado
                    if (doc.getXmlFirmadoBase64() != null && !doc.getXmlFirmadoBase64().isBlank()) {
                        try {
                            byte[] decodedXml = java.util.Base64.getDecoder().decode(doc.getXmlFirmadoBase64());
                            addZipEntry(zos, baseName + "_firmado.xml", decodedXml);
                        } catch (IllegalArgumentException e) {
                            // If it's not actually base64, save as is
                            addZipEntry(zos, baseName + "_firmado.xml",
                                    doc.getXmlFirmadoBase64().getBytes(StandardCharsets.UTF_8));
                        }
                    }

                    // Respuesta de Hacienda
                    if (doc.getXmlRespuestaHacienda() != null && !doc.getXmlRespuestaHacienda().isBlank()) {
                        addZipEntry(zos, baseName + "_respuesta_hacienda.xml",
                                doc.getXmlRespuestaHacienda().getBytes(StandardCharsets.UTF_8));
                    }
                }
            }

            String nombreArchivo = "FacturasEmitidas"
                    + (desde != null ? "_" + desde : "")
                    + (hasta != null ? "_al_" + hasta : "")
                    + ".zip";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", nombreArchivo);

            return ResponseEntity.ok().headers(headers).body(baos.toByteArray());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private void addZipEntry(ZipOutputStream zos, String name, byte[] data) throws Exception {
        zos.putNextEntry(new ZipEntry(name));
        zos.write(data);
        zos.closeEntry();
    }
}
