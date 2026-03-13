package com.agropecuariopos.backend.services;

import com.agropecuariopos.backend.dto.PurchaseRequest;
import com.agropecuariopos.backend.models.*;
import com.agropecuariopos.backend.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class PurchaseService {

    @Autowired
    private PurchaseRepository purchaseRepository;

    @Autowired
    private PurchaseItemRepository purchaseItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private AccountPayableRepository accountPayableRepository;

    @Transactional
    public Purchase createPurchase(PurchaseRequest request) {
        Purchase purchase = new Purchase();
        purchase.setInvoiceNumber(request.getInvoiceNumber());
        purchase.setDescription(request.getDescription());
        purchase.setPaymentMethod(request.getPaymentMethod());
        purchase.setStatus(Purchase.PurchaseStatus.COMPLETED);
        purchase.setTotalAmount(request.getTotalAmount());
        purchase.setCreatedDate(LocalDateTime.now());

        if (request.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findById(request.getSupplierId()).orElse(null);
            purchase.setSupplier(supplier);
        }

        Purchase savedPurchase = purchaseRepository.save(purchase);

        for (PurchaseRequest.PurchaseItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + itemReq.getProductId()));

            // Update Stock
            product.setStockQuantity(product.getStockQuantity() + itemReq.getQuantity());
            // Update Purchase Cost
            product.setPurchaseCost(itemReq.getCostPrice());
            productRepository.save(product);

            PurchaseItem item = new PurchaseItem();
            item.setPurchase(savedPurchase);
            item.setProduct(product);
            item.setQuantity(itemReq.getQuantity());
            item.setCostPrice(itemReq.getCostPrice());
            item.setLineTotal(itemReq.getCostPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity())));

            purchaseItemRepository.save(item);
            savedPurchase.getItems().add(item);
        }

        // If CREDIT, create Account Payable
        if (purchase.getPaymentMethod() == Purchase.PaymentMethod.CREDIT && purchase.getSupplier() != null) {
            AccountPayable payable = new AccountPayable();
            // Link supplierId accurately in AccountPayable.
            payable.setSupplierId(purchase.getSupplier().getId());
            payable.setSupplierName(purchase.getSupplier().getName());
            payable.setSupplierInvoiceReference(purchase.getInvoiceNumber());
            payable.setTotalDebt(purchase.getTotalAmount());
            payable.setAmountPaid(BigDecimal.ZERO);
            payable.setStatus(AccountPayable.PayableStatus.PENDING);
            payable.setDueDate(LocalDateTime.now().plusDays(30)); // Default 30 days
            accountPayableRepository.save(payable);
        }

        return savedPurchase;
    }
}
