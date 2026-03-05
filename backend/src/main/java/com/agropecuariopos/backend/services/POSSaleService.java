package com.agropecuariopos.backend.services;

import com.agropecuariopos.backend.dto.SaleRequest;
import com.agropecuariopos.backend.models.Product;
import com.agropecuariopos.backend.models.Sale;
import com.agropecuariopos.backend.models.SaleItem;
import com.agropecuariopos.backend.repositories.ProductRepository;
import com.agropecuariopos.backend.repositories.SaleRepository;
import com.agropecuariopos.backend.services.hacienda.XMLDocumentGeneratorV44;
import com.agropecuariopos.backend.services.hacienda.XadesSignatureService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;

@Service
public class POSSaleService {

    private static final Logger logger = LoggerFactory.getLogger(POSSaleService.class);

    // Tasas base de Costa Rica
    private static final BigDecimal IVA_STANDARD = new BigDecimal("0.13");
    private static final BigDecimal IVA_REDUCED_AGRO = new BigDecimal("0.01");

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private XMLDocumentGeneratorV44 xmlDocumentGenerator;

    @Autowired
    private XadesSignatureService xadesSignatureService;

    @Transactional
    public Sale processNewSale(SaleRequest request) {

        Sale newSale = new Sale();
        // Placeholder Invoice Numeration, later synced with actual Hacienda consecutive
        // format
        newSale.setInvoiceNumber("FE-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        newSale.setPaymentMethod(request.getPaymentMethod());
        newSale.setStatus(Sale.SaleStatus.COMPLETED); // Or pending if Credit
        newSale.setClientName(request.getClientName());
        newSale.setClientIdentification(request.getClientIdentification());

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal totalTax = BigDecimal.ZERO;
        BigDecimal finalTotal = BigDecimal.ZERO;
        BigDecimal totalGrossProfit = BigDecimal.ZERO;
        BigDecimal globalDiscount = request.getTotalDiscount() != null ? request.getTotalDiscount() : BigDecimal.ZERO;

        try {
            for (SaleRequest.SaleItemRequest itemReq : request.getItems()) {
                // Find strictly within transaction to ensure Optimistic Lock Catching
                Product product = productRepository.findById(itemReq.getProductId())
                        .orElseThrow(() -> new RuntimeException("Product Not Found. ID: " + itemReq.getProductId()));

                // Race condition protection: Check bounds
                if (product.getStockQuantity() < itemReq.getQuantity()) {
                    throw new RuntimeException("Insufficient stock for Product: " + product.getName() + " CABYS: "
                            + product.getCabysCode());
                }

                SaleItem saleItem = new SaleItem();
                saleItem.setSale(newSale);
                saleItem.setProduct(product);
                saleItem.setQuantity(itemReq.getQuantity());

                // Freeze the local economy context at the exact time of the transaction
                BigDecimal unitPrice = product.getSalePrice();
                BigDecimal unitCost = product.getPurchaseCost();
                BigDecimal itemDiscount = itemReq.getCustomDiscount() != null ? itemReq.getCustomDiscount()
                        : BigDecimal.ZERO;

                saleItem.setUnitPriceAtSale(unitPrice);
                saleItem.setUnitCostAtSale(unitCost);
                saleItem.setItemDiscount(itemDiscount);

                // Math execution
                BigDecimal rawLineTotal = unitPrice.multiply(new BigDecimal(itemReq.getQuantity().toString()))
                        .subtract(itemDiscount);

                // Exemptions calculation for Agro-Products 1% DGT-DGH-R-60-2019
                BigDecimal taxRate = IVA_STANDARD;
                if (Boolean.TRUE.equals(product.getIsAgrochemicalInsufficiency()) &&
                        request.getExonetAuthorizationCode() != null &&
                        !request.getExonetAuthorizationCode().trim().isEmpty()) {
                    taxRate = IVA_REDUCED_AGRO;
                }

                BigDecimal lineTax = rawLineTotal.multiply(taxRate).setScale(2, RoundingMode.HALF_UP);
                BigDecimal totalLineWithTax = rawLineTotal.add(lineTax);

                saleItem.setItemTax(lineTax);
                saleItem.setLineTotal(totalLineWithTax);

                // Substract inventory! This will throw ObjectOptimisticLockingFailureException
                // if two cashiers do it at the exact same millisecond.
                product.setStockQuantity(product.getStockQuantity() - itemReq.getQuantity());
                productRepository.save(product);

                // Add up to global bill
                subtotal = subtotal.add(rawLineTotal);
                totalTax = totalTax.add(lineTax);
                finalTotal = finalTotal.add(totalLineWithTax);

                // Core Profit Calculation: (Price * Qty) - (Cost * Qty) - Discounts
                BigDecimal itemsProfitBase = (unitPrice.subtract(unitCost))
                        .multiply(new BigDecimal(itemReq.getQuantity().toString()))
                        .subtract(itemDiscount);
                totalGrossProfit = totalGrossProfit.add(itemsProfitBase);

                newSale.getItems().add(saleItem);
            }

            // Subtract Global Discount from Final values
            finalTotal = finalTotal.subtract(globalDiscount);
            totalGrossProfit = totalGrossProfit.subtract(globalDiscount);

            newSale.setSubtotal(subtotal);
            newSale.setTotalTax(totalTax);
            newSale.setTotalDiscount(globalDiscount);
            newSale.setFinalTotal(finalTotal);
            newSale.setTotalGrossProfit(totalGrossProfit);

            // Persist entire graph
            Sale savedSale = saleRepository.save(newSale);

            // POST-Process: Emitir Facturacion Electronica al Ministerio asyncrona o
            // sincrona a eleccion (Aqui Sincrona de simulacion)
            try {
                // Generar Árbol
                String rawXml = xmlDocumentGenerator.buildInvoiceXML(savedSale, "3101123456", "Agropecuaria El Sol SA");
                // Firmar CR XAdES
                String p12PathPlaceholder = "dummy_path.p12"; // Reemplazo real a futuro .p12
                String signedXml = xadesSignatureService.signXmlDocument(rawXml, p12PathPlaceholder, "passwordOVI");

                logger.info("Factura XML Firmada y Lista para Envío:\n{}",
                        signedXml.substring(0, Math.min(signedXml.length(), 150)) + "...");

            } catch (Exception xmlGenEx) {
                // Si falla el XML, NO se deshace la Venta de Stock ni Caja.
                // Se encala para ser reintentado después por un Daemon en Contingencia (Circuit
                // Breaker local).
                logger.error(
                        "Error generando Doc Tributario, pasando operacion a estado Contingente (Reinyectar Luego): {}",
                        xmlGenEx.getMessage());
                savedSale.setStatus(Sale.SaleStatus.CONTINGENCY_PENDING);
                saleRepository.save(savedSale);
            }

            return savedSale;

        } catch (ObjectOptimisticLockingFailureException optimisticLockException) {
            logger.warn("Transaction collision. Optimistic Lock triggered on Inventory Reduction.");
            throw new RuntimeException(
                    "ERROR: The product you are trying to sell has just been updated or sold out by another cashier simultaneously. Please refresh the inventory grid.");
        }
    }
}
