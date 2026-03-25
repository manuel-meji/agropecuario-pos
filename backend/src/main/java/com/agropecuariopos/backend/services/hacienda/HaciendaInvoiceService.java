package com.agropecuariopos.backend.services.hacienda;

import com.agropecuariopos.backend.models.ElectronicInvoice;
import com.agropecuariopos.backend.models.Sale;
import com.agropecuariopos.backend.repositories.ElectronicInvoiceRepository;
import com.agropecuariopos.backend.repositories.SaleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
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

    @Autowired
    private com.agropecuariopos.backend.repositories.CompanySettingsRepository settingsRepository;

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
        invoiceRepository.findBySaleId(sale.getId()).stream()
                .filter(inv -> inv.getTipoComprobante() == ElectronicInvoice.TipoComprobante.FACTURA_ELECTRONICA || inv.getTipoComprobante() == ElectronicInvoice.TipoComprobante.TIQUETE_ELECTRONICO)
                .findFirst()
                .ifPresent(existing -> {
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
        // Persistir comprobante temporalmente para pasar la entidad al generador
        ElectronicInvoice invoice = invoiceRepository.findBySaleId(sale.getId())
                .stream().filter(inv -> inv.getTipoComprobante() == tipoComprobante)
                .findFirst()
                .orElse(new ElectronicInvoice());

        invoice.setSale(sale);
        invoice.setClave(clave50);
        invoice.setNumeroConsecutivo(numeroConsecutivo);
        invoice.setTipoComprobante(tipoComprobante);
        invoice.setEstado(ElectronicInvoice.EstadoComprobante.PENDIENTE);
        invoice = invoiceRepository.save(invoice);

        String xmlRaw = xmlGenerator.buildDocumentXML(invoice);
        logger.info("XML generado correctamente ({} chars)", xmlRaw.length());
        // LOG DIAGNÓSTICO — muestra el XML completo antes de firmar (quitar en producción)
        logger.warn("🔍 XML GENERADO (sin firma):\n{}", xmlRaw);

        // PASO 3: Firmar con XAdES usando el .p12 de Hacienda desde BD
        com.agropecuariopos.backend.models.CompanySettings settings = settingsRepository.findFirst()
                .orElseThrow(() -> new RuntimeException("No se encontró la configuración de la empresa para firmar."));
        
        if (settings.getHaciendaKeystoreFile() == null) {
            throw new RuntimeException("No se ha cargado el certificado .p12 en la configuración.");
        }

        String xmlFirmado = xadesService.signXmlDocument(xmlRaw, settings.getHaciendaKeystoreFile(), settings.getHaciendaKeystorePassword());
        logger.info("XML firmado exitosamente con certificado .p12");

        // PASO 4: Actualizar comprobante con el XML firmado
        invoice.setXmlGenerado(xmlRaw);
        invoice.setXmlFirmadoBase64(xmlFirmado);
        invoice = invoiceRepository.save(invoice);

        // PASO 5: Enviar a Hacienda
        try {
            submissionService.enviarComprobante(invoice);
            logger.info("✅ Comprobante enviado a Hacienda. Estado: {}", invoice.getEstado());
        } catch (Exception e) {
            logger.error("⚠️ Error crítico enviando a Hacienda (contingencia activada): {}", e.getMessage(), e);
            // No propagar — el daemon de polling reintentará automáticamente
        }

        return invoice;
    }

    /**
     * Emite una Nota de Crédito Electrónica para anular una Factura o Tiquete previamente generado.
     */
    @Transactional
    public ElectronicInvoice emitirNotaCredito(Sale sale, String razon) {
        // 1. Buscar el comprobante original que se va a anular (debe estar ACEPTADO)
        ElectronicInvoice facturaOriginal = invoiceRepository.findBySaleId(sale.getId()).stream()
                .filter(inv -> inv.getEstado() == ElectronicInvoice.EstadoComprobante.ACEPTADO || inv.getEstado() == ElectronicInvoice.EstadoComprobante.ENVIADO)
                .findFirst() // Al ser ManyToOne ahora, tomamos el primero (que debería ser la Factura o Tiquete)
                .orElseThrow(() -> new IllegalStateException("No se encontró factura original ACEPTADA para anular."));

        logger.info("🧾 Iniciando emisión NOTA_CREDITO para venta ID {}", sale.getId());

        // 2. Generar nuevo consecutivo y clave (tipo 03)
        String numeroConsecutivo = claveService.generarConsecutivo(TIPO_NOTA_CREDITO);
        String clave50 = claveService.generarClaveConConsecutivo(TIPO_NOTA_CREDITO, numeroConsecutivo, 1);

        logger.info("Clave generada para NC: {} | Consecutivo: {}", clave50, numeroConsecutivo);

        // 3. Crear el nuevo registro de ElectronicInvoice (la Nota de Crédito)
        ElectronicInvoice ncInvoice = new ElectronicInvoice();
        ncInvoice.setSale(sale);
        ncInvoice.setClave(clave50);
        ncInvoice.setNumeroConsecutivo(numeroConsecutivo);
        ncInvoice.setTipoComprobante(ElectronicInvoice.TipoComprobante.NOTA_CREDITO);
        ncInvoice.setEstado(ElectronicInvoice.EstadoComprobante.PENDIENTE);
        
        // Asignar los datos de referencia
        String tipoDocOriginal = facturaOriginal.getTipoComprobante() == ElectronicInvoice.TipoComprobante.FACTURA_ELECTRONICA ? TIPO_FACTURA : TIPO_TIQUETE;
        ncInvoice.setReferenciaTipoDocumento(tipoDocOriginal);
        ncInvoice.setReferenciaClave(facturaOriginal.getClave());
        ncInvoice.setReferenciaFechaEmision(facturaOriginal.getCreatedAt());
        ncInvoice.setReferenciaCodigo("01"); // 01 = Anula documento de referencia
        ncInvoice.setReferenciaRazon(razon != null ? razon : "Anulación de comprobante");
        
        ncInvoice = invoiceRepository.save(ncInvoice);

        // 4. Construir XML v4.4 pasando la entidad ncInvoice para que el generador acceda a las referencias
        String xmlRaw = xmlGenerator.buildDocumentXML(ncInvoice);
        logger.info("XML de Nota de Crédito generado correctamente");

        // 5. Firmar
        com.agropecuariopos.backend.models.CompanySettings settingsNC = settingsRepository.findFirst()
                .orElseThrow(() -> new RuntimeException("No se encontró la configuración de la empresa para firmar NC."));
        
        if (settingsNC.getHaciendaKeystoreFile() == null) {
            throw new RuntimeException("No se ha cargado el certificado .p12 en la configuración.");
        }

        String xmlFirmado = xadesService.signXmlDocument(xmlRaw, settingsNC.getHaciendaKeystoreFile(), settingsNC.getHaciendaKeystorePassword());

        // 6. Actualizar y persistir
        ncInvoice.setXmlGenerado(xmlRaw);
        ncInvoice.setXmlFirmadoBase64(xmlFirmado);
        ncInvoice = invoiceRepository.save(ncInvoice);

        // 7. Enviar a Hacienda
        try {
            submissionService.enviarComprobante(ncInvoice);
            logger.info("✅ NC enviada a Hacienda. Estado: {}", ncInvoice.getEstado());
        } catch (Exception e) {
            logger.error("⚠️ Error enviando NC a Hacienda: {}", e.getMessage());
        }

        return ncInvoice;
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
