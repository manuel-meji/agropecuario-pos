package com.agropecuariopos.backend.services.hacienda;

import com.agropecuariopos.backend.models.Sale;
import com.agropecuariopos.backend.models.SaleItem;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

/**
 * Motor de construcción del XML v4.4 para Facturación Electrónica Costa Rica.
 * Estructura conforme al XSD oficial:
 * https://www.hacienda.go.cr/docs/FacturaElectronica_V4.4.xsd.xml
 *
 * Secuencia raíz FacturaElectronica v4.4:
 * Clave → ProveedorSistemas → CodigoActividadEmisor → [CodigoActividadReceptor]
 * → NumeroConsecutivo → FechaEmision → Emisor → [Receptor]
 * → CondicionVenta → [DetalleServicio] → ResumenFactura → [ds:Signature]
 *
 * Cambios clave vs v4.3:
 * - CodigoActividad → CodigoActividadEmisor (6 dígitos exactos)
 * - ProveedorSistemas contiene la cédula del proveedor de sistema (tipo simple)
 * - MedioPago se movió DENTRO de ResumenFactura con sub-elemento TipoMedioPago
 * - LineaDetalle: BaseImponible obligatorio cuando gravado;
 * CodigoTarifa→CodigoTarifaIVA
 * - Descuento requiere CodigoDescuento (enum), no NaturalezaDescuento
 */
@Service
public class XMLDocumentGeneratorV44 {

    private static final Logger logger = LoggerFactory.getLogger(XMLDocumentGeneratorV44.class);

    private static final DateTimeFormatter HACIENDA_ISO_FORMATTER = DateTimeFormatter
            .ofPattern("yyyy-MM-dd'T'HH:mm:ssXXX");

    @Autowired
    private com.agropecuariopos.backend.repositories.CompanySettingsRepository settingsRepository;

    /**
     * Construye el XML v4.4 para Factura, Tiquete o Nota de Crédito.
     */
    public String buildDocumentXML(com.agropecuariopos.backend.models.ElectronicInvoice electronicInvoice) {
        Sale sale = electronicInvoice.getSale();
        String numeroConsecutivo = electronicInvoice.getNumeroConsecutivo();
        String clave50 = electronicInvoice.getClave();

        boolean tieneReceptor = sale.getClientIdentification() != null
                && !sale.getClientIdentification().isBlank();

        boolean esNotaCredito = electronicInvoice
                .getTipoComprobante() == com.agropecuariopos.backend.models.ElectronicInvoice.TipoComprobante.NOTA_CREDITO;
        String tipoDoc = esNotaCredito ? "Nota de Crédito"
                : (tieneReceptor ? "Factura Electrónica" : "Tiquete Electrónico");
        logger.info("Construyendo {} para venta {}", tipoDoc, sale.getInvoiceNumber());

        String fechaEmision = sale.getCreatedDate() != null
                ? sale.getCreatedDate().atOffset(ZoneOffset.of("-06:00")).format(HACIENDA_ISO_FORMATTER)
                : java.time.ZonedDateTime.now(ZoneOffset.of("-06:00")).format(HACIENDA_ISO_FORMATTER);

        com.agropecuariopos.backend.models.CompanySettings settings = settingsRepository.findFirst()
                .orElseThrow(() -> new RuntimeException("Configuración no encontrada para generar XML."));

        // CodigoActividadEmisor debe ser exactamente 6 dígitos
        String codigoActividad = padActividad(settings.getHaciendaActividadEconomica() != null ? settings.getHaciendaActividadEconomica() : "512102");

        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"utf-8\"?>\n");

        if (esNotaCredito) {
            xml.append(
                    "<NotaCreditoElectronica xmlns=\"https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.4/notaCreditoElectronica\" ");
        } else if (tieneReceptor) {
            xml.append(
                    "<FacturaElectronica xmlns=\"https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.4/facturaElectronica\" ");
        } else {
            xml.append(
                    "<TiqueteElectronico xmlns=\"https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.4/tiqueteElectronico\" ");
        }
        xml.append("xmlns:ds=\"http://www.w3.org/2000/09/xmldsig#\" ");
        xml.append("xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" ");
        xml.append("xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">\n");

        // ── Cabecera (orden EXACTO del XSD v4.4) ─────────────────────────────
        xml.append("  <Clave>").append(clave50).append("</Clave>\n");

        // ProveedorSistemas = cédula del proveedor de sistemas
        xml.append("  <ProveedorSistemas>").append(settings.getLegalId()).append("</ProveedorSistemas>\n");

        // CodigoActividadEmisor
        xml.append("  <CodigoActividadEmisor>").append(codigoActividad).append("</CodigoActividadEmisor>\n");

        xml.append("  <NumeroConsecutivo>").append(numeroConsecutivo).append("</NumeroConsecutivo>\n");
        xml.append("  <FechaEmision>").append(fechaEmision).append("</FechaEmision>\n");

        // ── Emisor ────────────────────────────────────────────────────────────
        xml.append("  <Emisor>\n");
        xml.append("    <Nombre>").append(escapeXml(settings.getBusinessName())).append("</Nombre>\n");
        xml.append("    <Identificacion>\n");
        String emisorTipoCedula = settings.getLegalId().length() > 10 ? "02" : "01";
        xml.append("      <Tipo>").append(emisorTipoCedula).append("</Tipo>\n");
        xml.append("      <Numero>").append(settings.getLegalId()).append("</Numero>\n");
        xml.append("    </Identificacion>\n");
        // ── Ubicación ────────────────────────────────────────────────────────
        xml.append("    <Ubicacion>\n");
        xml.append("      <Provincia>").append(padLocationCode(settings.getProvince(), 1)).append("</Provincia>\n");
        xml.append("      <Canton>").append(padLocationCode(settings.getCanton(), 2)).append("</Canton>\n");
        xml.append("      <Distrito>").append(padLocationCode(settings.getDistrito(), 2)).append("</Distrito>\n");
        
        String barrioTxt = settings.getBarrio() != null && !settings.getBarrio().isBlank() ? settings.getBarrio().trim() : "Barrio Central";
        if (barrioTxt.length() < 5) barrioTxt = String.format("%-5s", barrioTxt).replace(' ', '_'); 
        if (barrioTxt.length() > 50) barrioTxt = barrioTxt.substring(0, 50);
        xml.append("      <Barrio>").append(escapeXml(barrioTxt)).append("</Barrio>\n");
        
        String checkSenas = settings.getAddress() != null ? settings.getAddress() : "Otras señas";
        xml.append("      <OtrasSenas>")
                .append(escapeXml(checkSenas.length() > 250 ? checkSenas.substring(0, 250) : checkSenas))
                .append("</OtrasSenas>\n");
        xml.append("    </Ubicacion>\n");
        xml.append("    <Telefono>\n");
        xml.append("      <CodigoPais>506</CodigoPais>\n");
        xml.append("      <NumTelefono>").append(settings.getPhone() != null ? settings.getPhone() : "00000000").append("</NumTelefono>\n");
        xml.append("    </Telefono>\n");
        xml.append("    <CorreoElectronico>").append(settings.getEmail() != null ? settings.getEmail() : "email@example.com").append("</CorreoElectronico>\n");
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
            // OtrasSenasExtranjero: obligatorio cuando TipoIdentificacion = 05 (Extranjero
            // No Domiciliado)
            if ("05".equals(tipoReceptor)) {
                // Intentar obtener dirección del cliente registrado, o usar valor por defecto
                String senasExtranjero = (sale.getClient() != null && sale.getClient().getAddress() != null
                        && !sale.getClient().getAddress().isBlank())
                                ? sale.getClient().getAddress()
                                : "Extranjero No Domiciliado";
                xml.append("    <OtrasSenasExtranjero>").append(escapeXml(senasExtranjero))
                        .append("</OtrasSenasExtranjero>\n");
            }
            xml.append("  </Receptor>\n");
        }

        // ── Condición Venta ───────────────────────────────────────────────────
        // MedioPago ya NO va aquí en v4.4 — se movió dentro de ResumenFactura
        // 01=Contado, 02=Crédito
        String condicionVenta = (sale.getPaymentMethod() == Sale.PaymentMethod.CREDIT) ? "02" : "01";
        xml.append("  <CondicionVenta>").append(condicionVenta).append("</CondicionVenta>\n");
        // -58: PlazoCredito es OBLIGATORIO cuando CondicionVenta=02 (crédito)
        if ("02".equals(condicionVenta)) {
            xml.append("  <PlazoCredito>30</PlazoCredito>\n"); // 30 días por defecto
        }

        // ── Detalle de Servicios / Productos ──────────────────────────────────
        // Pre-calcular el total de MontoTotal de todos los ítems para poder
        // distribuir el descuento global proporcionalmente por línea.
        // Esto es necesario para que Σ(MontoDescuento de líneas) = TotalDescuentos.
        BigDecimal globalDiscount = sale.getTotalDiscount() != null ? sale.getTotalDiscount() : BigDecimal.ZERO;
        BigDecimal sumMontoTotal = BigDecimal.ZERO;
        for (SaleItem it : sale.getItems()) {
            BigDecimal qtyIt = new BigDecimal(it.getQuantity().toString());
            BigDecimal priceIt = it.getUnitPriceAtSale();
            sumMontoTotal = sumMontoTotal.add(priceIt.multiply(qtyIt));
        }

        xml.append("  <DetalleServicio>\n");
        int lineNumber = 1;
        BigDecimal totalMercanciasGravadas = BigDecimal.ZERO;
        BigDecimal totalExentos = BigDecimal.ZERO;

        for (SaleItem item : sale.getItems()) {
            BigDecimal qty = new BigDecimal(item.getQuantity().toString());
            BigDecimal unitPrice = item.getUnitPriceAtSale();
            BigDecimal itemDiscount = item.getItemDiscount() != null ? item.getItemDiscount() : BigDecimal.ZERO;
            BigDecimal montoTotal = unitPrice.multiply(qty);

            // Distribuir el descuento global proporcionalmente a este ítem
            BigDecimal globalDiscountForLine = BigDecimal.ZERO;
            if (globalDiscount.compareTo(BigDecimal.ZERO) > 0 && sumMontoTotal.compareTo(BigDecimal.ZERO) > 0) {
                globalDiscountForLine = globalDiscount
                        .multiply(montoTotal)
                        .divide(sumMontoTotal, 5, RoundingMode.HALF_UP);
            }
            BigDecimal totalLineDiscount = itemDiscount.add(globalDiscountForLine);

            BigDecimal subTotal = montoTotal.subtract(totalLineDiscount);
            BigDecimal impuesto = item.getItemTax() != null ? item.getItemTax() : BigDecimal.ZERO;

            boolean gravado = impuesto.compareTo(BigDecimal.ZERO) > 0;

            // CABYS code: debe ser exactamente 13 dígitos
            String cabysCode = item.getProduct().getCabysCode();
            if (cabysCode == null || cabysCode.isBlank())
                cabysCode = "0000000000000";

            xml.append("    <LineaDetalle>\n");
            xml.append("      <NumeroLinea>").append(lineNumber++).append("</NumeroLinea>\n");
            xml.append("      <CodigoCABYS>").append(cabysCode).append("</CodigoCABYS>\n"); // v4.4: mayúsculas
            xml.append("      <Cantidad>").append(qty.setScale(3, RoundingMode.HALF_UP).toPlainString())
                    .append("</Cantidad>\n");
            xml.append("      <UnidadMedida>Unid</UnidadMedida>\n");
            xml.append("      <Detalle>").append(escapeXml(item.getProduct().getName())).append("</Detalle>\n");
            xml.append("      <PrecioUnitario>").append(unitPrice.setScale(5, RoundingMode.HALF_UP).toPlainString())
                    .append("</PrecioUnitario>\n");
            xml.append("      <MontoTotal>").append(montoTotal.setScale(5, RoundingMode.HALF_UP).toPlainString())
                    .append("</MontoTotal>\n");

            // Descuento: incluye ítem + porción proporcional del descuento global
            if (totalLineDiscount.compareTo(BigDecimal.ZERO) > 0) {
                xml.append("      <Descuento>\n");
                xml.append("        <MontoDescuento>")
                        .append(totalLineDiscount.setScale(5, RoundingMode.HALF_UP).toPlainString())
                        .append("</MontoDescuento>\n");
                xml.append("        <CodigoDescuento>07</CodigoDescuento>\n"); // 07 = Descuento Comercial
                xml.append("      </Descuento>\n");
            }

            xml.append("      <SubTotal>").append(subTotal.setScale(5, RoundingMode.HALF_UP).toPlainString())
                    .append("</SubTotal>\n");

            // BaseImponible es SIEMPRE obligatorio en el XSD v4.4
            xml.append("      <BaseImponible>").append(subTotal.setScale(5, RoundingMode.HALF_UP).toPlainString())
                    .append("</BaseImponible>\n");

            if (gravado) {
                String codigoTarifaIVA = Boolean.TRUE.equals(item.getProduct().getIsAgrochemicalInsufficiency()) ? "02"
                        : "08"; // 08=13%, 02=1%
                String tarifaIVA = Boolean.TRUE.equals(item.getProduct().getIsAgrochemicalInsufficiency()) ? "1.00"
                        : "13.00";

                // Exoneración
                BigDecimal montoExoneracion = item.getExoneracionMonto() != null ? item.getExoneracionMonto()
                        : BigDecimal.ZERO;
                BigDecimal impuestoFacturado = impuesto.add(montoExoneracion); // El impuesto total sin exonerar

                xml.append("      <Impuesto>\n");
                xml.append("        <Codigo>01</Codigo>\n"); // 01 = IVA
                xml.append("        <CodigoTarifaIVA>").append(codigoTarifaIVA).append("</CodigoTarifaIVA>\n");
                xml.append("        <Tarifa>").append(tarifaIVA).append("</Tarifa>\n");
                xml.append("        <Monto>")
                        .append(impuestoFacturado.setScale(5, RoundingMode.HALF_UP).toPlainString())
                        .append("</Monto>\n");

                if (item.getExoneracionTipoDocumento() != null && !item.getExoneracionTipoDocumento().isBlank()) {
                    xml.append("        <Exoneracion>\n");
                    xml.append("          <TipoDocumento>").append(item.getExoneracionTipoDocumento())
                            .append("</TipoDocumento>\n");
                    xml.append("          <NumeroDocumento>").append(item.getExoneracionNumeroDocumento())
                            .append("</NumeroDocumento>\n");
                    xml.append("          <NombreInstitucion>").append(item.getExoneracionNombreInstitucion())
                            .append("</NombreInstitucion>\n");
                    xml.append("          <FechaEmision>").append(item.getExoneracionFechaEmision()
                            .atOffset(ZoneOffset.of("-06:00")).format(HACIENDA_ISO_FORMATTER))
                            .append("</FechaEmision>\n");
                    xml.append("          <PorcentajeExoneracion>").append(item.getExoneracionPorcentaje())
                            .append("</PorcentajeExoneracion>\n");
                    xml.append("          <MontoExoneracion>")
                            .append(montoExoneracion.setScale(5, RoundingMode.HALF_UP).toPlainString())
                            .append("</MontoExoneracion>\n");
                    xml.append("        </Exoneracion>\n");
                }

                xml.append("      </Impuesto>\n");
                xml.append("      <ImpuestoAsumidoEmisorFabrica>0.00000</ImpuestoAsumidoEmisorFabrica>\n");
                xml.append("      <ImpuestoNeto>").append(impuesto.setScale(5, RoundingMode.HALF_UP).toPlainString())
                        .append("</ImpuestoNeto>\n");
                totalMercanciasGravadas = totalMercanciasGravadas.add(montoTotal);
            } else {
                xml.append("      <Impuesto>\n");
                xml.append("        <Codigo>01</Codigo>\n");
                xml.append("        <CodigoTarifaIVA>10</CodigoTarifaIVA>\n"); // 10 = Tarifa Exenta
                xml.append("        <Tarifa>0.00</Tarifa>\n");
                xml.append("        <Monto>0.00000</Monto>\n");
                xml.append("      </Impuesto>\n");
                xml.append("      <ImpuestoAsumidoEmisorFabrica>0.00000</ImpuestoAsumidoEmisorFabrica>\n");
                xml.append("      <ImpuestoNeto>0.00000</ImpuestoNeto>\n");
                totalExentos = totalExentos.add(montoTotal);
            }
            // MontoTotalLinea = SubTotal + ImpuestoNeto (regla -46 de Hacienda)
            // Se calcula en tiempo de generación, NO desde el valor guardado en BD,
            // porque subTotal ya incluye la porción proporcional del descuento global.
            BigDecimal montoTotalLineaCalculado = subTotal.add(impuesto);
            xml.append("      <MontoTotalLinea>")
                    .append(montoTotalLineaCalculado.setScale(5, RoundingMode.HALF_UP).toPlainString())
                    .append("</MontoTotalLinea>\n");
            xml.append("    </LineaDetalle>\n");
        }
        xml.append("  </DetalleServicio>\n");

        // ── ResumenFactura ────────────────────────────────────────────────────
        // TotalVenta = Σ(MontoTotal de cada línea) — sin descontar nada
        // TotalDescuentos = Σ(MontoDescuento de cada línea) = itemDiscounts + globalDiscount (proporcional)
        // TotalVentaNeta = TotalVenta - TotalDescuentos
        // globalDiscount ya fue declarado antes del loop de ítems.
        BigDecimal itemDiscountsSum = BigDecimal.ZERO;
        for (SaleItem item : sale.getItems()) {
            if (item.getItemDiscount() != null && item.getItemDiscount().compareTo(BigDecimal.ZERO) > 0) {
                itemDiscountsSum = itemDiscountsSum.add(item.getItemDiscount());
            }
        }
        BigDecimal totalDescuentos = itemDiscountsSum.add(globalDiscount);
        BigDecimal totalVenta = totalMercanciasGravadas.add(totalExentos);
        BigDecimal totalVentaNeta = totalVenta.subtract(totalDescuentos);

        // Calcular el TotalImpuesto como la suma exacta de los impuestos aplicados en
        // cada linea
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
            xml.append("    <TotalMercanciasGravadas>")
                    .append(totalMercanciasGravadas.setScale(5, RoundingMode.HALF_UP).toPlainString())
                    .append("</TotalMercanciasGravadas>\n");
        }
        if (totalExentos.compareTo(BigDecimal.ZERO) > 0) {
            xml.append("    <TotalMercanciasExentas>")
                    .append(totalExentos.setScale(5, RoundingMode.HALF_UP).toPlainString())
                    .append("</TotalMercanciasExentas>\n");
        }
        if (totalMercanciasGravadas.compareTo(BigDecimal.ZERO) > 0) {
            xml.append("    <TotalGravado>")
                    .append(totalMercanciasGravadas.setScale(5, RoundingMode.HALF_UP).toPlainString())
                    .append("</TotalGravado>\n");
        }
        if (totalExentos.compareTo(BigDecimal.ZERO) > 0) {
            xml.append("    <TotalExento>").append(totalExentos.setScale(5, RoundingMode.HALF_UP).toPlainString())
                    .append("</TotalExento>\n");
        }

        xml.append("    <TotalVenta>").append(totalVenta.setScale(5, RoundingMode.HALF_UP).toPlainString())
                .append("</TotalVenta>\n");

        if (totalDescuentos.compareTo(BigDecimal.ZERO) > 0) {
            xml.append("    <TotalDescuentos>")
                    .append(totalDescuentos.setScale(5, RoundingMode.HALF_UP).toPlainString())
                    .append("</TotalDescuentos>\n");
        }
        xml.append("    <TotalVentaNeta>").append(totalVentaNeta.setScale(5, RoundingMode.HALF_UP).toPlainString())
                .append("</TotalVentaNeta>\n");

        // Agrupar impuestos para generar TotalDesgloseImpuesto, obligatorio en v4.4 si
        // hay <Impuesto>
        java.util.Map<String, BigDecimal> desgloseImpuestos = new java.util.LinkedHashMap<>();
        for (SaleItem item : sale.getItems()) {
            BigDecimal imp = item.getItemTax() != null ? item.getItemTax() : BigDecimal.ZERO;
            if (imp.compareTo(BigDecimal.ZERO) > 0) {
                String codigo = "01";
                String codigoTarifaIVA = Boolean.TRUE.equals(item.getProduct().getIsAgrochemicalInsufficiency()) ? "02"
                        : "08";
                String key = codigo + "|" + codigoTarifaIVA;
                desgloseImpuestos.put(key, desgloseImpuestos.getOrDefault(key, BigDecimal.ZERO).add(imp));
            } else {
                // Exento
                String key = "01|10";
                desgloseImpuestos.put(key, desgloseImpuestos.getOrDefault(key, BigDecimal.ZERO).add(BigDecimal.ZERO));
            }
        }

        for (java.util.Map.Entry<String, BigDecimal> entry : desgloseImpuestos.entrySet()) {
            String[] parts = entry.getKey().split("\\|");
            xml.append("    <TotalDesgloseImpuesto>\n");
            xml.append("      <Codigo>").append(parts[0]).append("</Codigo>\n");
            xml.append("      <CodigoTarifaIVA>").append(parts[1]).append("</CodigoTarifaIVA>\n");
            xml.append("      <TotalMontoImpuesto>")
                    .append(entry.getValue().setScale(5, RoundingMode.HALF_UP).toPlainString())
                    .append("</TotalMontoImpuesto>\n");
            xml.append("    </TotalDesgloseImpuesto>\n");
        }

        if (_totalImpuestoExacto.compareTo(BigDecimal.ZERO) > 0) {
            xml.append("    <TotalImpuesto>")
                    .append(_totalImpuestoExacto.setScale(5, RoundingMode.HALF_UP).toPlainString())
                    .append("</TotalImpuesto>\n");
        }

        xml.append("    <MedioPago>\n");
        String tipoMedioPago = mapMedioPago(sale.getPaymentMethod());
        xml.append("      <TipoMedioPago>").append(tipoMedioPago).append("</TipoMedioPago>\n");
        // v4.4: cuando TipoMedioPago = 99, el campo <MedioPagoOtros> es OBLIGATORIO
        if ("99".equals(tipoMedioPago)) {
            xml.append("      <MedioPagoOtros>Crédito</MedioPagoOtros>\n");
        }
        xml.append("    </MedioPago>\n");

        xml.append("    <TotalComprobante>").append(totalComprobante.setScale(5, RoundingMode.HALF_UP).toPlainString())
                .append("</TotalComprobante>\n");
        xml.append("  </ResumenFactura>\n");

        if (electronicInvoice.getReferenciaClave() != null && !electronicInvoice.getReferenciaClave().isBlank()) {
            xml.append("  <InformacionReferencia>\n");
            xml.append("    <TipoDoc>").append(electronicInvoice.getReferenciaTipoDocumento()).append("</TipoDoc>\n");
            xml.append("    <Numero>").append(electronicInvoice.getReferenciaClave()).append("</Numero>\n");
            xml.append("    <FechaEmision>").append(electronicInvoice.getReferenciaFechaEmision()
                    .atOffset(ZoneOffset.of("-06:00")).format(HACIENDA_ISO_FORMATTER)).append("</FechaEmision>\n");
            xml.append("    <Codigo>").append(electronicInvoice.getReferenciaCodigo()).append("</Codigo>\n");
            xml.append("    <Razon>").append(escapeXml(electronicInvoice.getReferenciaRazon())).append("</Razon>\n");
            xml.append("  </InformacionReferencia>\n");
        }

        if (esNotaCredito) {
            xml.append("</NotaCreditoElectronica>");
        } else if (tieneReceptor) {
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
        if (codigo == null || codigo.isBlank())
            return "000000";
        
        // El usuario solicitó enviar el código '4620.0' tal cual, sin formateo de 6 dígitos.
        // Si el código ya contiene un formato especial (como un punto), lo respetamos.
        if (codigo.contains(".")) {
            return codigo;
        }

        String clean = codigo.replaceAll("[^0-9]", "");
        if (clean.length() > 6)
            return clean.substring(0, 6);
        return String.format("%06d", Long.parseLong(clean.isEmpty() ? "0" : clean));
    }

    /**
     * Determina el tipo de identificación del receptor según la Resolución
     * 0027-2024 v4.4.
     *
     * Tipos soportados:
     * 01 = Cédula Física (9 dígitos)
     * 02 = Cédula Jurídica (10 dígitos)
     * 03 = DIMEX (11-12 dígitos)
     * 04 = NITE (10 dígitos, mismo largo que jurídica — se distingue por contexto
     * externo)
     * 05 = Extranjero No Domiciliado (hasta 20 caracteres alfanuméricos)
     * 06 = No Contribuyente / Consumidor Final
     *
     * Lógica: si la cédula tiene caracteres no numéricos o longitud > 12 chars →
     * tipo 05 (extranjero).
     * Si el campo viene vacío o null → tipo 06 (No Contribuyente).
     */
    private String detectTipoCedula(String cedula) {
        if (cedula == null || cedula.isBlank())
            return "06"; // No Contribuyente
        String clean = cedula.trim();
        String soloDigitos = clean.replaceAll("[^0-9]", "");
        // Si tiene caracteres no numéricos o longitud fuera del rango costarricense →
        // Extranjero (05)
        if (!clean.equals(soloDigitos) || clean.length() > 12) {
            return "05"; // Extranjero No Domiciliado — hasta 20 chars según v4.4
        }
        return switch (soloDigitos.length()) {
            case 9 -> "01"; // Cédula Física
            case 10 -> "02"; // Cédula Jurídica (o NITE — se asume jurídica por defecto)
            case 11, 12 -> "03"; // DIMEX
            default -> "06"; // No Contribuyente
        };
    }

    /**
     * Mapea el método de pago del POS al código de TipoMedioPago de Hacienda v4.4.
     * 01=Efectivo, 02=Tarjeta, 03=Cheque, 04=Transferencia, 05=Terceros,
     * 06=SINPE Móvil (NUEVO v4.4), 07=Plataforma Digital (NUEVO v4.4), 99=Otros
     */
    private String mapMedioPago(Sale.PaymentMethod pm) {
        if (pm == null)
            return "01";
        return switch (pm) {
            case CASH -> "01";
            case CARD -> "02";
            case TRANSFER -> "04"; // Transferencia/depósito bancario
            case SINPE_MOVIL, SIMPE_MOVIL -> "06"; // SINPE Móvil (código nuevo v4.4)
            case CREDIT -> "99"; // Otros
        };
    }

    private String escapeXml(String s) {
        if (s == null)
            return "";
        return s.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }

    private String safeStr(String s) {
        return s != null ? s : "";
    }

    private String padLocationCode(String code, int length) {
        if (code == null || code.isBlank()) {
            return length == 1 ? "1" : "01";
        }
        String clean = code.replaceAll("[^0-9]", "");
        if (clean.length() > length)
            return clean.substring(0, length);
        try {
            long val = Long.parseLong(clean.isEmpty() ? "1" : clean);
            return String.format("%0" + length + "d", val);
        } catch (NumberFormatException e) {
            return length == 1 ? "1" : "01";
        }
    }
}
