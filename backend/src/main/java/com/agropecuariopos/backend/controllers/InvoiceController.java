package com.agropecuariopos.backend.controllers;

import com.agropecuariopos.backend.models.ElectronicInvoice;
import com.agropecuariopos.backend.models.Sale;
import com.agropecuariopos.backend.repositories.ElectronicInvoiceRepository;
import com.agropecuariopos.backend.repositories.SaleRepository;
import com.agropecuariopos.backend.services.hacienda.HaciendaInvoiceService;
import com.agropecuariopos.backend.services.hacienda.HaciendaSubmissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

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

    /**
     * Emite el comprobante electrónico de una venta.
     * Útil para emitir manualmente si la emisión automática falló.
     * POST /api/invoices/{saleId}/emit
     */
    @PostMapping("/{saleId}/emit")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CASHIER')")
    public ResponseEntity<?> emitirFactura(@PathVariable Long saleId) {
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
        return invoiceRepository.findBySaleId(saleId)
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
}
