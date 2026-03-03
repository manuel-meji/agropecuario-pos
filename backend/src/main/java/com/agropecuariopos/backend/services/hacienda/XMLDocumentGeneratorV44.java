package com.agropecuariopos.backend.services.hacienda;

import com.agropecuariopos.backend.models.Sale;
import com.agropecuariopos.backend.models.SaleItem;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.RoundingMode;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
public class XMLDocumentGeneratorV44 {

    private static final Logger logger = LoggerFactory.getLogger(XMLDocumentGeneratorV44.class);

    // Formato exacto requerido: 2024-11-20T10:35:05-06:00
    private static final DateTimeFormatter HACIENDA_ISO_FORMATTER = DateTimeFormatter
            .ofPattern("yyyy-MM-dd'T'HH:mm:ssXXX");

    /**
     * Motor compilador de estructura Estricta (XSD Version 4.4 MH-CR).
     */
    public String buildInvoiceXML(Sale sale, String emitterIdentification, String companyName) {
        logger.info("Construyendo Árbol de Nodos XML para transaccion {}", sale.getInvoiceNumber());

        // Document ID de 50 Espacios obligatorio para Hacienda
        String generatedKeyCR = generate50DigitHaciendaKey(emitterIdentification, "01", sale.getInvoiceNumber());

        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"utf-8\"?>\n");
        xml.append(
                "<FacturaElectronica xmlns=\"https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.4/facturaElectronica\" ");
        xml.append("xmlns:ds=\"http://www.w3.org/2000/09/xmldsig#\" ");
        xml.append("xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" ");
        xml.append("xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">\n");

        xml.append("  <Clave>").append(generatedKeyCR).append("</Clave>\n");
        // Factura Electronica: 01
        xml.append("  <CodigoActividad>123456</CodigoActividad>\n"); // Default CIIU
        xml.append("  <NumeroConsecutivo>").append(sale.getInvoiceNumber()).append("</NumeroConsecutivo>\n");

        String fechaEmision = sale.getCreatedDate() != null
                ? sale.getCreatedDate().atOffset(ZoneOffset.of("-06:00")).format(HACIENDA_ISO_FORMATTER)
                : java.time.ZonedDateTime.now(ZoneOffset.of("-06:00")).format(HACIENDA_ISO_FORMATTER);

        xml.append("  <FechaEmision>").append(fechaEmision).append("</FechaEmision>\n");

        // Emisor Node (Obligatorio)
        xml.append("  <Emisor>\n");
        xml.append("    <Nombre>").append(companyName).append("</Nombre>\n");
        xml.append("    <Identificacion>\n");
        xml.append("      <Tipo>01</Tipo>\n"); // Fisica
        xml.append("      <Numero>").append(emitterIdentification).append("</Numero>\n");
        xml.append("    </Identificacion>\n");
        xml.append("    <Ubicacion>\n");
        xml.append("      <Provincia>1</Provincia>\n");
        xml.append("      <Canton>01</Canton>\n");
        xml.append("      <Distrito>01</Distrito>\n");
        xml.append("      <OtrasSenas>Oficinas Centrales POS</OtrasSenas>\n");
        xml.append("    </Ubicacion>\n");
        xml.append("    <CorreoElectronico>admin@agropecuario.com</CorreoElectronico>\n");
        xml.append("  </Emisor>\n");

        // Detalle de los artículos CABYS
        xml.append("  <DetalleServicio>\n");
        int lineNumber = 1;
        for (SaleItem item : sale.getItems()) {
            xml.append("    <LineaDetalle>\n");
            xml.append("      <NumeroLinea>").append(lineNumber++).append("</NumeroLinea>\n");
            xml.append("      <Codigo>").append(item.getProduct().getCabysCode()).append("</Codigo>\n");
            xml.append("      <Cantidad>").append(item.getQuantity().toString()).append("</Cantidad>\n");
            xml.append("      <UnidadMedida>Unid</UnidadMedida>\n"); // Default Unidades
            xml.append("      <Detalle>").append(item.getProduct().getName()).append("</Detalle>\n");
            xml.append("      <PrecioUnitario>")
                    .append(item.getUnitPriceAtSale().setScale(5, RoundingMode.HALF_UP).toPlainString())
                    .append("</PrecioUnitario>\n");
            xml.append("      <MontoTotal>")
                    .append(item.getUnitPriceAtSale().multiply(new java.math.BigDecimal(item.getQuantity()))
                            .setScale(5, RoundingMode.HALF_UP).toPlainString())
                    .append("</MontoTotal>\n");

            // Impuestos
            if (item.getItemTax().compareTo(java.math.BigDecimal.ZERO) > 0) {
                xml.append("      <Impuesto>\n");
                // Ley 9635 IVA / Agromiquimos Reducido
                xml.append("        <Codigo>01</Codigo>\n");
                // Exonet 1% o Estandar 13% (Dependiendo del CABYS)
                String tarifaIVA = Boolean.TRUE.equals(item.getProduct().getIsAgrochemicalInsufficiency()) ? "1.0"
                        : "13.0";
                xml.append("        <Tarifa>").append(tarifaIVA).append("</Tarifa>\n");
                xml.append("        <Monto>")
                        .append(item.getItemTax().setScale(5, RoundingMode.HALF_UP).toPlainString())
                        .append("</Monto>\n");
                xml.append("      </Impuesto>\n");
            }

            xml.append("      <MontoTotalLinea>")
                    .append(item.getLineTotal().setScale(5, RoundingMode.HALF_UP).toPlainString())
                    .append("</MontoTotalLinea>\n");
            xml.append("    </LineaDetalle>\n");
        }
        xml.append("  </DetalleServicio>\n");

        // Resumen Final
        xml.append("  <ResumenFactura>\n");
        xml.append("    <CodigoTipoMoneda>\n");
        xml.append("      <CodigoMoneda>CRC</CodigoMoneda>\n");
        xml.append("      <TipoCambio>1.00000</TipoCambio>\n");
        xml.append("    </CodigoTipoMoneda>\n");
        xml.append("    <TotalServGravados>0.00000</TotalServGravados>\n");
        xml.append("    <TotalServExentos>0.00000</TotalServExentos>\n");
        xml.append("    <TotalMercanciasGravadas>")
                .append(sale.getSubtotal().setScale(5, RoundingMode.HALF_UP).toPlainString())
                .append("</TotalMercanciasGravadas>\n");
        xml.append("    <TotalMercanciasExentas>0.00000</TotalMercanciasExentas>\n");
        xml.append("    <TotalGravado>").append(sale.getSubtotal().setScale(5, RoundingMode.HALF_UP).toPlainString())
                .append("</TotalGravado>\n");
        xml.append("    <TotalExento>0.00000</TotalExento>\n");
        xml.append("    <TotalVenta>").append(sale.getSubtotal().setScale(5, RoundingMode.HALF_UP).toPlainString())
                .append("</TotalVenta>\n");
        xml.append("    <TotalDescuentos>")
                .append(sale.getTotalDiscount().setScale(5, RoundingMode.HALF_UP).toPlainString())
                .append("</TotalDescuentos>\n");
        xml.append("    <TotalVentaNeta>").append(
                sale.getSubtotal().subtract(sale.getTotalDiscount()).setScale(5, RoundingMode.HALF_UP).toPlainString())
                .append("</TotalVentaNeta>\n");
        xml.append("    <TotalImpuesto>").append(sale.getTotalTax().setScale(5, RoundingMode.HALF_UP).toPlainString())
                .append("</TotalImpuesto>\n");
        xml.append("    <TotalComprobante>")
                .append(sale.getFinalTotal().setScale(5, RoundingMode.HALF_UP).toPlainString())
                .append("</TotalComprobante>\n");
        xml.append("  </ResumenFactura>\n");

        xml.append("</FacturaElectronica>");

        return xml.toString();
    }

    /**
     * Construye la Llave Encriptada de 50 dígitos numéricos según la ley de CR
     */
    private String generate50DigitHaciendaKey(String id, String docType, String consecutivo) {
        String country = "506";
        String day = java.time.LocalDate.now().format(DateTimeFormatter.ofPattern("dd"));
        String month = java.time.LocalDate.now().format(DateTimeFormatter.ofPattern("MM"));
        String year = java.time.LocalDate.now().format(DateTimeFormatter.ofPattern("yy"));
        String cedulaPadded = String.format("%012d", Long.parseLong(id));
        String companySequence = "00100001" + docType + consecutivo.replaceAll("[^0-9]", "");
        String securityCode = UUID.randomUUID().toString().replaceAll("[^0-9]", "").substring(0, 8);
        if (companySequence.length() < 20) {
            companySequence = String.format("%020d", 1);
        } // Fallback demo
        if (securityCode.length() < 8) {
            securityCode = "12345678";
        } // Fallback demo

        return country + day + month + year + cedulaPadded + companySequence.substring(0, 20) + "1" + securityCode;
    }
}
