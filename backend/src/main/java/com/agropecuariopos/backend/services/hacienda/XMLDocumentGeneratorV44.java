package com.agropecuariopos.backend.services.hacienda;

import com.agropecuariopos.backend.models.Sale;
import com.agropecuariopos.backend.models.SaleItem;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

/**
 * Motor de construcción del XML v4.4 para Facturación Electrónica Costa Rica.
 * Estructura conforme al XSD oficial: https://www.hacienda.go.cr/docs/FacturaElectronica_V4.4.xsd.xml
 *
 * Secuencia raíz FacturaElectronica v4.4:
 *   Clave → ProveedorSistemas → CodigoActividadEmisor → [CodigoActividadReceptor]
 *   → NumeroConsecutivo → FechaEmision → Emisor → [Receptor]
 *   → CondicionVenta → [DetalleServicio] → ResumenFactura → [ds:Signature]
 *
 * Cambios clave vs v4.3:
 *   - CodigoActividad → CodigoActividadEmisor (6 dígitos exactos)
 *   - ProveedorSistemas contiene la cédula del proveedor de sistema (tipo simple)
 *   - MedioPago se movió DENTRO de ResumenFactura con sub-elemento TipoMedioPago
 *   - LineaDetalle: BaseImponible obligatorio cuando gravado; CodigoTarifa→CodigoTarifaIVA
 *   - Descuento requiere CodigoDescuento (enum), no NaturalezaDescuento
 */
@Service
public class XMLDocumentGeneratorV44 {

    private static final Logger logger = LoggerFactory.getLogger(XMLDocumentGeneratorV44.class);

    private static final DateTimeFormatter HACIENDA_ISO_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ssXXX");

    // Datos del emisor — inyectados desde application.properties
    @Value("${hacienda.emisor.nombre}")
    private String emisorNombre;

    @Value("${hacienda.emisor.cedula}")
    private String emisorCedula;

    @Value("${hacienda.emisor.tipo.cedula}")
    private String emisorTipoCedula;

    @Value("${hacienda.emisor.provincia}")
    private String emisorProvincia;

    @Value("${hacienda.emisor.canton}")
    private String emisorCanton;

    @Value("${hacienda.emisor.distrito}")
    private String emisorDistrito;

    @Value("${hacienda.emisor.actividad.economica}")
    private String emisorActividadEconomica;

    @Value("${hacienda.emisor.email}")
    private String emisorEmail;

    @Value("${hacienda.emisor.telefono}")
    private String emisorTelefono;

    @Value("${hacienda.ambiente}")
    private String ambiente;

    /**
     * Construye el XML de Factura Electrónica v4.4 a partir de una venta.
     * Si el cliente tiene cédula → Factura Electrónica (01)
     * Si no → Tiquete Electrónico (04)
     */
    public String buildInvoiceXML(Sale sale, String numeroConsecutivo, String clave50) {
        boolean tieneReceptor = sale.getClientIdentification() != null
                && !sale.getClientIdentification().isBlank();

        String tipoDoc = tieneReceptor ? "Factura Electrónica" : "Tiquete Electrónico";
        logger.info("Construyendo {} para venta {}", tipoDoc, sale.getInvoiceNumber());

        String fechaEmision = sale.getCreatedDate() != null
                ? sale.getCreatedDate().atOffset(ZoneOffset.of("-06:00")).format(HACIENDA_ISO_FORMATTER)
                : java.time.ZonedDateTime.now(ZoneOffset.of("-06:00")).format(HACIENDA_ISO_FORMATTER);

        // CodigoActividadEmisor debe ser exactamente 6 dígitos
        String codigoActividad = padActividad(emisorActividadEconomica);

        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"utf-8\"?>\n");

        if (tieneReceptor) {
            xml.append("<FacturaElectronica xmlns=\"https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.4/facturaElectronica\" ");
        } else {
            xml.append("<TiqueteElectronico xmlns=\"https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.4/tiqueteElectronico\" ");
        }
        xml.append("xmlns:ds=\"http://www.w3.org/2000/09/xmldsig#\" ");
        xml.append("xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" ");
        xml.append("xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">\n");

        // ── Cabecera (orden EXACTO del XSD v4.4) ─────────────────────────────
        xml.append("  <Clave>").append(clave50).append("</Clave>\n");

        // ProveedorSistemas = cédula del proveedor de sistemas (tipo simple, max 20 chars)
        xml.append("  <ProveedorSistemas>").append(emisorCedula).append("</ProveedorSistemas>\n");

        // CodigoActividadEmisor: exactamente 6 dígitos (nuevo en v4.4, reemplaza CodigoActividad)
        xml.append("  <CodigoActividadEmisor>").append(codigoActividad).append("</CodigoActividadEmisor>\n");

        xml.append("  <NumeroConsecutivo>").append(numeroConsecutivo).append("</NumeroConsecutivo>\n");
        xml.append("  <FechaEmision>").append(fechaEmision).append("</FechaEmision>\n");

        // ── Emisor ────────────────────────────────────────────────────────────
        xml.append("  <Emisor>\n");
        xml.append("    <Nombre>").append(escapeXml(emisorNombre)).append("</Nombre>\n");
        xml.append("    <Identificacion>\n");
        xml.append("      <Tipo>").append(emisorTipoCedula).append("</Tipo>\n");
        xml.append("      <Numero>").append(emisorCedula).append("</Numero>\n");
        xml.append("    </Identificacion>\n");
        xml.append("    <Ubicacion>\n");
        xml.append("      <Provincia>").append(emisorProvincia).append("</Provincia>\n");
        xml.append("      <Canton>").append(emisorCanton).append("</Canton>\n");
        xml.append("      <Distrito>").append(emisorDistrito).append("</Distrito>\n");
        xml.append("      <OtrasSenas>Costa Rica</OtrasSenas>\n");
        xml.append("    </Ubicacion>\n");
        xml.append("    <Telefono>\n");
        xml.append("      <CodigoPais>506</CodigoPais>\n");
        xml.append("      <NumTelefono>").append(emisorTelefono).append("</NumTelefono>\n");
        xml.append("    </Telefono>\n");
        xml.append("    <CorreoElectronico>").append(emisorEmail).append("</CorreoElectronico>\n");
        xml.append("  </Emisor>\n");

        // ── Receptor (solo en Factura Electrónica) ────────────────────────────
        if (tieneReceptor) {
            xml.append("  <Receptor>\n");
            xml.append("    <Nombre>").append(escapeXml(safeStr(sale.getClientName()))).append("</Nombre>\n");
            xml.append("    <Identificacion>\n");
            String tipoReceptor = detectTipoCedula(sale.getClientIdentification());
            xml.append("      <Tipo>").append(tipoReceptor).append("</Tipo>\n");
            xml.append("      <Numero>").append(sale.getClientIdentification()).append("</Numero>\n");
            xml.append("    </Identificacion>\n");
            xml.append("  </Receptor>\n");
        }

        // ── Condición Venta ───────────────────────────────────────────────────
        // MedioPago ya NO va aquí en v4.4 — se movió dentro de ResumenFactura
        xml.append("  <CondicionVenta>01</CondicionVenta>\n"); // 01 = Contado

        // ── Detalle de Servicios / Productos ──────────────────────────────────
        xml.append("  <DetalleServicio>\n");
        int lineNumber = 1;
        BigDecimal totalMercanciasGravadas = BigDecimal.ZERO;
        BigDecimal totalExentos            = BigDecimal.ZERO;

        for (SaleItem item : sale.getItems()) {
            BigDecimal qty          = new BigDecimal(item.getQuantity().toString());
            BigDecimal unitPrice    = item.getUnitPriceAtSale();
            BigDecimal itemDiscount = item.getItemDiscount() != null ? item.getItemDiscount() : BigDecimal.ZERO;
            BigDecimal montoTotal   = unitPrice.multiply(qty);
            BigDecimal subTotal     = montoTotal.subtract(itemDiscount);
            BigDecimal impuesto     = item.getItemTax()    != null ? item.getItemTax()    : BigDecimal.ZERO;
            BigDecimal montoTotalLinea = item.getLineTotal();

            boolean gravado = impuesto.compareTo(BigDecimal.ZERO) > 0;

            // CABYS code: debe ser exactamente 13 dígitos
            String cabysCode = item.getProduct().getCabysCode();
            if (cabysCode == null || cabysCode.isBlank()) cabysCode = "0000000000000";

            xml.append("    <LineaDetalle>\n");
            xml.append("      <NumeroLinea>").append(lineNumber++).append("</NumeroLinea>\n");
            xml.append("      <CodigoCABYS>").append(cabysCode).append("</CodigoCABYS>\n");  // v4.4: mayúsculas
            xml.append("      <Cantidad>").append(qty.setScale(3, RoundingMode.HALF_UP).toPlainString()).append("</Cantidad>\n");
            xml.append("      <UnidadMedida>Unid</UnidadMedida>\n");
            xml.append("      <Detalle>").append(escapeXml(item.getProduct().getName())).append("</Detalle>\n");
            xml.append("      <PrecioUnitario>").append(unitPrice.setScale(5, RoundingMode.HALF_UP).toPlainString()).append("</PrecioUnitario>\n");
            xml.append("      <MontoTotal>").append(montoTotal.setScale(5, RoundingMode.HALF_UP).toPlainString()).append("</MontoTotal>\n");

            // Descuento: CodigoDescuento es obligatorio en v4.4 cuando hay descuento
            if (itemDiscount.compareTo(BigDecimal.ZERO) > 0) {
                xml.append("      <Descuento>\n");
                xml.append("        <MontoDescuento>").append(itemDiscount.setScale(5, RoundingMode.HALF_UP).toPlainString()).append("</MontoDescuento>\n");
                xml.append("        <CodigoDescuento>07</CodigoDescuento>\n"); // 07 = Descuento Comercial
                xml.append("      </Descuento>\n");
            }

            xml.append("      <SubTotal>").append(subTotal.setScale(5, RoundingMode.HALF_UP).toPlainString()).append("</SubTotal>\n");

            // ─── BaseImponible es SIEMPRE obligatorio en el XSD v4.4 (sin minOccurs=0) ───
            // Para gravado: base imponible = subTotal
            // Para exento:  base imponible = subTotal (Hacienda la requiere igual)
            xml.append("      <BaseImponible>").append(subTotal.setScale(5, RoundingMode.HALF_UP).toPlainString()).append("</BaseImponible>\n");

            if (gravado) {
                String codigoTarifaIVA = Boolean.TRUE.equals(item.getProduct().getIsAgrochemicalInsufficiency()) ? "02" : "08"; // 08=13%, 02=1%
                String tarifaIVA       = Boolean.TRUE.equals(item.getProduct().getIsAgrochemicalInsufficiency()) ? "1.00" : "13.00";
                xml.append("      <Impuesto>\n");
                xml.append("        <Codigo>01</Codigo>\n"); // 01 = IVA
                xml.append("        <CodigoTarifaIVA>").append(codigoTarifaIVA).append("</CodigoTarifaIVA>\n");
                xml.append("        <Tarifa>").append(tarifaIVA).append("</Tarifa>\n");
                xml.append("        <Monto>").append(impuesto.setScale(5, RoundingMode.HALF_UP).toPlainString()).append("</Monto>\n");
                xml.append("      </Impuesto>\n");
                xml.append("      <ImpuestoAsumidoEmisorFabrica>0.00000</ImpuestoAsumidoEmisorFabrica>\n");
                xml.append("      <ImpuestoNeto>").append(impuesto.setScale(5, RoundingMode.HALF_UP).toPlainString()).append("</ImpuestoNeto>\n");
                totalMercanciasGravadas = totalMercanciasGravadas.add(subTotal);
            } else {
                // Exento: Impuesto también es OBLIGATORIO en el XSD (sin minOccurs=0)
                // CodigoTarifaIVA=10 (Tarifa Exenta), Tarifa=0.00, Monto=0
                xml.append("      <Impuesto>\n");
                xml.append("        <Codigo>01</Codigo>\n");
                xml.append("        <CodigoTarifaIVA>10</CodigoTarifaIVA>\n"); // 10 = Tarifa Exenta
                xml.append("        <Tarifa>0.00</Tarifa>\n");
                xml.append("        <Monto>0.00000</Monto>\n");
                xml.append("      </Impuesto>\n");
                xml.append("      <ImpuestoAsumidoEmisorFabrica>0.00000</ImpuestoAsumidoEmisorFabrica>\n");
                xml.append("      <ImpuestoNeto>0.00000</ImpuestoNeto>\n");
                totalExentos = totalExentos.add(subTotal);
            }
            xml.append("      <MontoTotalLinea>").append(montoTotalLinea.setScale(5, RoundingMode.HALF_UP).toPlainString()).append("</MontoTotalLinea>\n");
            xml.append("    </LineaDetalle>\n");
        }
        xml.append("  </DetalleServicio>\n");

        // ── ResumenFactura ────────────────────────────────────────────────────
        // TotalVenta = TotalGravado + TotalExento (SIN descuentos — XSD v4.4)
        // TotalVentaNeta = TotalVenta - TotalDescuentos
        BigDecimal totalDescuentos  = sale.getTotalDiscount() != null ? sale.getTotalDiscount() : BigDecimal.ZERO;
        BigDecimal totalVenta       = totalMercanciasGravadas.add(totalExentos);
        BigDecimal totalVentaNeta   = totalVenta.subtract(totalDescuentos);
        
        // Calcular el TotalImpuesto como la suma exacta de los impuestos aplicados en cada linea
        BigDecimal _totalImpuestoExacto = BigDecimal.ZERO;
        for (SaleItem item : sale.getItems()) {
             BigDecimal imp = item.getItemTax() != null ? item.getItemTax() : BigDecimal.ZERO;
             if (imp.compareTo(BigDecimal.ZERO) > 0) {
                 _totalImpuestoExacto = _totalImpuestoExacto.add(imp);
             }
        }
        
        // Calcular TotalComprobante según la formula estricta de Hacienda
        BigDecimal totalComprobante = totalVentaNeta.add(_totalImpuestoExacto);

        xml.append("  <ResumenFactura>\n");
        xml.append("    <CodigoTipoMoneda>\n");
        xml.append("      <CodigoMoneda>CRC</CodigoMoneda>\n");
        xml.append("      <TipoCambio>1.00000</TipoCambio>\n");
        xml.append("    </CodigoTipoMoneda>\n");

        if (totalMercanciasGravadas.compareTo(BigDecimal.ZERO) > 0) {
            xml.append("    <TotalMercanciasGravadas>").append(totalMercanciasGravadas.setScale(5, RoundingMode.HALF_UP).toPlainString()).append("</TotalMercanciasGravadas>\n");
        }
        if (totalExentos.compareTo(BigDecimal.ZERO) > 0) {
            xml.append("    <TotalMercanciasExentas>").append(totalExentos.setScale(5, RoundingMode.HALF_UP).toPlainString()).append("</TotalMercanciasExentas>\n");
        }
        if (totalMercanciasGravadas.compareTo(BigDecimal.ZERO) > 0) {
            xml.append("    <TotalGravado>").append(totalMercanciasGravadas.setScale(5, RoundingMode.HALF_UP).toPlainString()).append("</TotalGravado>\n");
        }
        if (totalExentos.compareTo(BigDecimal.ZERO) > 0) {
            xml.append("    <TotalExento>").append(totalExentos.setScale(5, RoundingMode.HALF_UP).toPlainString()).append("</TotalExento>\n");
        }

        xml.append("    <TotalVenta>").append(totalVenta.setScale(5, RoundingMode.HALF_UP).toPlainString()).append("</TotalVenta>\n");

        if (totalDescuentos.compareTo(BigDecimal.ZERO) > 0) {
            xml.append("    <TotalDescuentos>").append(totalDescuentos.setScale(5, RoundingMode.HALF_UP).toPlainString()).append("</TotalDescuentos>\n");
        }
        xml.append("    <TotalVentaNeta>").append(totalVentaNeta.setScale(5, RoundingMode.HALF_UP).toPlainString()).append("</TotalVentaNeta>\n");

        if (_totalImpuestoExacto.compareTo(BigDecimal.ZERO) > 0) {
            xml.append("    <TotalImpuesto>").append(_totalImpuestoExacto.setScale(5, RoundingMode.HALF_UP).toPlainString()).append("</TotalImpuesto>\n");
        }

        xml.append("    <MedioPago>\n");
        xml.append("      <TipoMedioPago>").append(mapMedioPago(sale.getPaymentMethod())).append("</TipoMedioPago>\n");
        xml.append("    </MedioPago>\n");

        xml.append("    <TotalComprobante>").append(totalComprobante.setScale(5, RoundingMode.HALF_UP).toPlainString()).append("</TotalComprobante>\n");
        xml.append("  </ResumenFactura>\n");

        if (tieneReceptor) {
            xml.append("</FacturaElectronica>");
        } else {
            xml.append("</TiqueteElectronico>");
        }

        return xml.toString();
    }

    /**
     * Garantiza exactamente 6 dígitos para CodigoActividadEmisor.
     */
    private String padActividad(String codigo) {
        if (codigo == null || codigo.isBlank()) return "000000";
        String clean = codigo.replaceAll("[^0-9]", "");
        if (clean.length() > 6) return clean.substring(0, 6);
        return String.format("%06d", Long.parseLong(clean.isEmpty() ? "0" : clean));
    }

    /**
     * Determina el tipo de identificación del receptor según longitud de cédula.
     */
    private String detectTipoCedula(String cedula) {
        if (cedula == null) return "06"; // No Contribuyente
        String clean = cedula.replaceAll("[^0-9]", "");
        return switch (clean.length()) {
            case 9       -> "01"; // Cédula Física
            case 10      -> "02"; // Cédula Jurídica
            case 11, 12  -> "03"; // DIMEX
            default      -> "06"; // No Contribuyente
        };
    }

    /**
     * Mapea el método de pago del POS al código de TipoMedioPago de Hacienda v4.4.
     * 01=Efectivo, 02=Tarjeta, 03=Cheque, 04=Transferencia, 05=Terceros,
     * 06=SINPE Móvil (NUEVO v4.4), 07=Plataforma Digital (NUEVO v4.4), 99=Otros
     */
    private String mapMedioPago(Sale.PaymentMethod pm) {
        if (pm == null) return "01";
        return switch (pm) {
            case CASH                        -> "01";
            case CARD                        -> "02";
            case TRANSFER                    -> "04"; // Transferencia/depósito bancario
            case SINPE_MOVIL, SIMPE_MOVIL    -> "06"; // SINPE Móvil (código nuevo v4.4)
            case CREDIT                      -> "99"; // Otros
        };
    }

    private String escapeXml(String s) {
        if (s == null) return "";
        return s.replace("&",  "&amp;")
                .replace("<",  "&lt;")
                .replace(">",  "&gt;")
                .replace("\"", "&quot;")
                .replace("'",  "&apos;");
    }

    private String safeStr(String s) {
        return s != null ? s : "";
    }
}
