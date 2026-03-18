package com.agropecuariopos.backend.services.hacienda;

import com.agropecuariopos.backend.models.ReceivedDocument;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

/**
 * Genera el XML MensajeReceptor v4.4 para confirmar o rechazar facturas recibidas.
 * Implementa el Art. 10 de la Resolución MH-DGT-RES-0027-2024.
 *
 * MensajeReceptor tiene 3 tipos:
 *   1 = Aceptado Total
 *   2 = Aceptado Parcial (requiere MontoTotalImpuestoAceptado y TotalFacturAceptado)
 *   3 = Rechazado (requiere DetalleMensaje mínimo 5 chars)
 *
 * El XML generado debe firmarse con XAdES igual que una factura electrónica,
 * luego enviarse via POST al endpoint /recepcion de Hacienda.
 */
@Service
public class MensajeReceptorGeneratorService {

    private static final Logger logger = LoggerFactory.getLogger(MensajeReceptorGeneratorService.class);
    private static final DateTimeFormatter HACIENDA_ISO = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ssXXX");
    private static final String NAMESPACE = "https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.4/mensajeReceptor";

    @Value("${hacienda.emisor.cedula}")
    private String receptorCedula;

    @Value("${hacienda.emisor.tipo.cedula}")
    private String receptorTipoCedula;

    @Value("${hacienda.emisor.actividad.economica}")
    private String actividadEconomica;

    /**
     * Aceptar Total (Mensaje = 1).
     * El receptor acepta el comprobante completamente tal como fue emitido.
     */
    public String generarAceptacionTotal(ReceivedDocument doc) {
        logger.info("Generando MensajeReceptor Aceptación Total para clave: {}", doc.getClave());
        StringBuilder xml = new StringBuilder();
        buildXmlBase(xml, doc, 1);
        xml.append("  <DetalleMensaje>Aceptación total del comprobante</DetalleMensaje>\n");
        if (doc.getMontoTotal() != null) {
            xml.append("  <MontoTotalImpuesto>").append(formatMonto(BigDecimal.ZERO)).append("</MontoTotalImpuesto>\n");
            xml.append("  <TotalFactura>").append(formatMonto(doc.getMontoTotal())).append("</TotalFactura>\n");
        }
        xml.append("</MensajeReceptor>");
        return xml.toString();
    }

    /**
     * Aceptar Parcial (Mensaje = 2).
     * El receptor acepta solo una parte del comprobante (p.ej. por defecto en entrega).
     */
    public String generarAceptacionParcial(ReceivedDocument doc, BigDecimal montoAceptado, String detalle) {
        logger.info("Generando MensajeReceptor Aceptación Parcial para clave: {}", doc.getClave());
        StringBuilder xml = new StringBuilder();
        buildXmlBase(xml, doc, 2);
        xml.append("  <DetalleMensaje>").append(escapeXml(detalle)).append("</DetalleMensaje>\n");
        xml.append("  <MontoTotalImpuesto>").append(formatMonto(BigDecimal.ZERO)).append("</MontoTotalImpuesto>\n");
        xml.append("  <TotalFactura>").append(formatMonto(montoAceptado)).append("</TotalFactura>\n");
        xml.append("</MensajeReceptor>");
        return xml.toString();
    }

    /**
     * Rechazar (Mensaje = 3).
     * El receptor rechaza el comprobante. DetalleMensaje es obligatorio (≥5 chars).
     */
    public String generarRechazo(ReceivedDocument doc, String detalle) {
        if (detalle == null || detalle.trim().length() < 5) {
            throw new IllegalArgumentException("El DetalleMensaje del rechazo debe tener al menos 5 caracteres");
        }
        logger.info("Generando MensajeReceptor Rechazo para clave: {}", doc.getClave());
        StringBuilder xml = new StringBuilder();
        buildXmlBase(xml, doc, 3);
        xml.append("  <DetalleMensaje>").append(escapeXml(detalle.trim())).append("</DetalleMensaje>\n");
        xml.append("</MensajeReceptor>");
        return xml.toString();
    }

    // ── Builder interno ───────────────────────────────────────────────────────

    private void buildXmlBase(StringBuilder xml, ReceivedDocument doc, int mensaje) {
        xml.append("<?xml version=\"1.0\" encoding=\"utf-8\"?>\n");
        xml.append("<MensajeReceptor xmlns=\"").append(NAMESPACE).append("\" ");
        xml.append("xmlns:ds=\"http://www.w3.org/2000/09/xmldsig#\" ");
        xml.append("xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">\n");

        // Clave del comprobante recibido (50 dígitos)
        xml.append("  <Clave>").append(doc.getClave()).append("</Clave>\n");

        // Cédula del receptor (quien emite el mensaje = nosotros)
        xml.append("  <NumeroCedulaReceptor>").append(receptorCedula).append("</NumeroCedulaReceptor>\n");

        // Cédula del emisor del comprobante original (el proveedor)
        xml.append("  <NumeroCedulaEmisor>").append(doc.getCedulaEmisor()).append("</NumeroCedulaEmisor>\n");

        // Fecha de emisión del comprobante original
        if (doc.getFechaEmisionDoc() != null) {
            String fechaStr = doc.getFechaEmisionDoc()
                    .atOffset(java.time.ZoneOffset.of("-06:00"))
                    .format(HACIENDA_ISO);
            xml.append("  <FechaEmisionDoc>").append(fechaStr).append("</FechaEmisionDoc>\n");
        }

        // Tipo de mensaje: 1=Aceptado, 2=Parcial, 3=Rechazado
        xml.append("  <Mensaje>").append(mensaje).append("</Mensaje>\n");
    }

    private String formatMonto(BigDecimal m) {
        if (m == null) return "0.00000";
        return m.setScale(5, java.math.RoundingMode.HALF_UP).toPlainString();
    }

    private String escapeXml(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }
}
