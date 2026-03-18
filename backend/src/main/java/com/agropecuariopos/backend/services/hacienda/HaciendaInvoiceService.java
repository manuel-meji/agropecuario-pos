package com.agropecuariopos.backend.services.hacienda;

import com.agropecuariopos.backend.models.ElectronicInvoice;
import com.agropecuariopos.backend.models.Sale;
import com.agropecuariopos.backend.repositories.ElectronicInvoiceRepository;
import com.agropecuariopos.backend.repositories.SaleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Orquestador principal del flujo de Facturación Electrónica.
 * Coordina: Clave → Consecutivo → XML → Firma → Envío → Polling
 */
@Service
public class HaciendaInvoiceService {

    private static final Logger logger = LoggerFactory.getLogger(HaciendaInvoiceService.class);

    // Tipos de documento Hacienda
    public static final String TIPO_FACTURA = "01";
    public static final String TIPO_NOTA_DEBITO = "02";
    public static final String TIPO_NOTA_CREDITO = "03";
    public static final String TIPO_TIQUETE = "04";

    @Value("${hacienda.crypto.keystore.path}")
    private String p12Path;

    @Value("${hacienda.crypto.keystore.password}")
    private String p12Password;

    @Autowired
    private ClaveHaciendaService claveService;

    @Autowired
    private XMLDocumentGeneratorV44 xmlGenerator;

    @Autowired
    private XadesSignatureService xadesService;

    @Autowired
    private HaciendaSubmissionService submissionService;

    @Autowired
    private ElectronicInvoiceRepository invoiceRepository;

    @Autowired
    private SaleRepository saleRepository;

    /**
     * Emite el comprobante electrónico de forma ASÍNCRONA, post-commit de la venta.
     * SIN @Transactional propio: cada save del repositorio crea su propia tx
     * y hace commit inmediatamente, evitando deadlocks con enviarComprobante.
     */
    @Async
    public void emitirComprobanteAsync(Long saleId) {
        try {
            Sale sale = saleRepository.findByIdWithItems(saleId)
                    .orElseThrow(() -> new RuntimeException("Venta no encontrada para emitir comprobante: " + saleId));

            emitirComprobante(sale);

        } catch (Exception e) {
            logger.error("❌ Error asíncrono emitiendo comprobante para venta {}: {}", saleId, e.getMessage(), e);
        }
    }

    /**
     * Emite un comprobante electrónico a partir de una venta (uso directo/manual).
     * SIN @Transactional: cada operación de repositorio maneja su propia tx.
     */
    public ElectronicInvoice emitirComprobante(Sale sale) {
        // ¿Ya tiene un comprobante ACEPTADO?
        invoiceRepository.findBySaleId(sale.getId()).ifPresent(existing -> {
            if (existing.getEstado() == ElectronicInvoice.EstadoComprobante.ACEPTADO) {
                throw new IllegalStateException("Esta venta ya tiene un comprobante ACEPTADO. Clave: " + existing.getClave());
            }
        });

        boolean tieneReceptor = sale.getClientIdentification() != null
                && !sale.getClientIdentification().isBlank();

        String tipoDoc = tieneReceptor ? TIPO_FACTURA : TIPO_TIQUETE;
        ElectronicInvoice.TipoComprobante tipoComprobante = tieneReceptor
                ? ElectronicInvoice.TipoComprobante.FACTURA_ELECTRONICA
                : ElectronicInvoice.TipoComprobante.TIQUETE_ELECTRONICO;

        logger.info("🧾 Iniciando emisión {} para venta ID {}", tipoComprobante, sale.getId());

        // PASO 1: Usar consecutivo ya asignado en la venta y generar clave de 50 dígitos
        String numeroConsecutivo = sale.getInvoiceNumber();
        String clave50 = claveService.generarClaveConConsecutivo(tipoDoc, numeroConsecutivo, 1);

        logger.info("Clave generada: {} | Consecutivo: {}", clave50, numeroConsecutivo);

        // PASO 2: Construir XML v4.4
        String xmlRaw = xmlGenerator.buildInvoiceXML(sale, numeroConsecutivo, clave50);
        logger.info("XML generado correctamente ({} chars)", xmlRaw.length());
        // LOG DIAGNÓSTICO — muestra el XML completo antes de firmar (quitar en producción)
        logger.warn("🔍 XML GENERADO (sin firma):\n{}", xmlRaw);

        // PASO 3: Firmar con XAdES usando el .p12 de Hacienda
        String xmlFirmado = xadesService.signXmlDocument(xmlRaw, p12Path, p12Password);
        logger.info("XML firmado exitosamente con certificado .p12");

        // PASO 4: Persistir comprobante en estado PENDIENTE
        ElectronicInvoice invoice = invoiceRepository.findBySaleId(sale.getId())
                .orElse(new ElectronicInvoice());

        invoice.setSale(sale);
        invoice.setClave(clave50);
        invoice.setNumeroConsecutivo(numeroConsecutivo);
        invoice.setTipoComprobante(tipoComprobante);
        invoice.setEstado(ElectronicInvoice.EstadoComprobante.PENDIENTE);
        invoice.setXmlGenerado(xmlRaw);
        invoice.setXmlFirmadoBase64(xmlFirmado);
        invoice = invoiceRepository.save(invoice);

        // PASO 5: Enviar a Hacienda
        try {
            submissionService.enviarComprobante(invoice);
            logger.info("✅ Comprobante enviado a Hacienda. Estado: {}", invoice.getEstado());
        } catch (Exception e) {
            logger.error("⚠️ Error enviando a Hacienda (contingencia activada): {}", e.getMessage());
            // No propagar — el daemon de polling reintentará automáticamente
        }

        return invoice;
    }

    /**
     * Reintento manual de envío de un comprobante fallido.
     */
    @Transactional
    public ElectronicInvoice reenviarComprobante(Long invoiceId) {
        ElectronicInvoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Comprobante no encontrado: " + invoiceId));

        if (invoice.getEstado() == ElectronicInvoice.EstadoComprobante.ACEPTADO) {
            throw new IllegalStateException("El comprobante ya fue aceptado, no se puede reenviar.");
        }

        submissionService.enviarComprobante(invoice);
        return invoice;
    }
}
