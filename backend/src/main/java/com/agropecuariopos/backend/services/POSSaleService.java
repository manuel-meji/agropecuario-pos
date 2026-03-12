package com.agropecuariopos.backend.services;

import com.agropecuariopos.backend.dto.SaleRequest;
import com.agropecuariopos.backend.models.Product;
import com.agropecuariopos.backend.models.Sale;
import com.agropecuariopos.backend.models.SaleItem;
import com.agropecuariopos.backend.repositories.ProductRepository;
import com.agropecuariopos.backend.repositories.SaleRepository;
import com.agropecuariopos.backend.services.hacienda.HaciendaInvoiceService;
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

    private static final BigDecimal IVA_STANDARD = new BigDecimal("0.13");
    private static final BigDecimal IVA_REDUCED_AGRO = new BigDecimal("0.01");

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private HaciendaInvoiceService haciendaInvoiceService;

    @Autowired
    private com.agropecuariopos.backend.repositories.ClientRepository clientRepository;

    @Transactional
    public Sale processNewSale(SaleRequest request) {

        Sale newSale = new Sale();
        newSale.setInvoiceNumber("FE-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        newSale.setPaymentMethod(request.getPaymentMethod());
        newSale.setStatus(Sale.SaleStatus.COMPLETED);
        newSale.setClientName(request.getClientName());
        newSale.setClientIdentification(request.getClientIdentification());

        if (request.getClientId() != null) {
            com.agropecuariopos.backend.models.Client client = clientRepository.findById(request.getClientId())
                    .orElseThrow(() -> new RuntimeException("Client Not Found. ID: " + request.getClientId()));
            newSale.setClient(client);
        }

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal totalTax = BigDecimal.ZERO;
        BigDecimal finalTotal = BigDecimal.ZERO;
        BigDecimal totalGrossProfit = BigDecimal.ZERO;
        BigDecimal globalDiscount = request.getTotalDiscount() != null ? request.getTotalDiscount() : BigDecimal.ZERO;

        try {
            for (SaleRequest.SaleItemRequest itemReq : request.getItems()) {
                Product product = productRepository.findById(itemReq.getProductId())
                        .orElseThrow(() -> new RuntimeException("Product Not Found. ID: " + itemReq.getProductId()));

                if (product.getStockQuantity() < itemReq.getQuantity()) {
                    throw new RuntimeException("Insufficient stock for Product: " + product.getName()
                            + " CABYS: " + product.getCabysCode());
                }

                SaleItem saleItem = new SaleItem();
                saleItem.setSale(newSale);
                saleItem.setProduct(product);
                saleItem.setQuantity(itemReq.getQuantity());

                BigDecimal unitPrice = product.getSalePrice();
                BigDecimal unitCost = product.getPurchaseCost();
                BigDecimal itemDiscount = itemReq.getCustomDiscount() != null ? itemReq.getCustomDiscount() : BigDecimal.ZERO;

                saleItem.setUnitPriceAtSale(unitPrice);
                saleItem.setUnitCostAtSale(unitCost);
                saleItem.setItemDiscount(itemDiscount);

                BigDecimal rawLineTotal = unitPrice.multiply(new BigDecimal(itemReq.getQuantity().toString()))
                        .subtract(itemDiscount);

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

                product.setStockQuantity(product.getStockQuantity() - itemReq.getQuantity());
                productRepository.save(product);

                subtotal = subtotal.add(rawLineTotal);
                totalTax = totalTax.add(lineTax);
                finalTotal = finalTotal.add(totalLineWithTax);

                BigDecimal itemsProfitBase = (unitPrice.subtract(unitCost))
                        .multiply(new BigDecimal(itemReq.getQuantity().toString()))
                        .subtract(itemDiscount);
                totalGrossProfit = totalGrossProfit.add(itemsProfitBase);

                newSale.getItems().add(saleItem);
            }

            finalTotal = finalTotal.subtract(globalDiscount);
            totalGrossProfit = totalGrossProfit.subtract(globalDiscount);

            newSale.setSubtotal(subtotal);
            newSale.setTotalTax(totalTax);
            newSale.setTotalDiscount(globalDiscount);
            newSale.setFinalTotal(finalTotal);
            newSale.setTotalGrossProfit(totalGrossProfit);

            Sale savedSale = saleRepository.save(newSale);

            // ——— Facturación Electrónica Hacienda (ASÍNCRONO) ———
            // Se ejecuta en hilo separado DESPUÉS del commit de la venta.
            // Si falla, no afecta la venta. El daemon de polling reintentará.
            haciendaInvoiceService.emitirComprobanteAsync(savedSale.getId());
            logger.info("Emisión de comprobante electrónico encolada para venta {}", savedSale.getId());

            return savedSale;

        } catch (ObjectOptimisticLockingFailureException optimisticLockException) {
            logger.warn("Transaction collision. Optimistic Lock triggered on Inventory Reduction.");
            throw new RuntimeException(
                    "ERROR: El producto fue vendido simultáneamente por otro cajero. Por favor refrescá el inventario.");
        }
    }
}
