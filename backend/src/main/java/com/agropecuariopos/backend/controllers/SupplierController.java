package com.agropecuariopos.backend.controllers;

import com.agropecuariopos.backend.models.Supplier;
import com.agropecuariopos.backend.repositories.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;
import java.util.List;
import com.agropecuariopos.backend.dto.SupplierHistoryDTO;
import java.time.LocalDateTime;
import com.agropecuariopos.backend.models.AccountPayable;
import com.agropecuariopos.backend.models.PayablePaymentRecord;
import com.agropecuariopos.backend.models.Purchase;
import com.agropecuariopos.backend.repositories.PayablePaymentRecordRepository;
import com.agropecuariopos.backend.repositories.PurchaseRepository;
import org.springframework.lang.Nullable;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/suppliers")

public class SupplierController {

    @Autowired
    private SupplierRepository supplierRepository;

    @GetMapping
    public List<Supplier> getAllSuppliers() {
        return supplierRepository.findAll();
    }

    @PostMapping
    public Supplier createSupplier(@RequestBody Supplier supplier) {
        return supplierRepository.save(supplier);
    }

    @Autowired
    private com.agropecuariopos.backend.repositories.AccountPayableRepository accountPayableRepository;

    @Autowired
    private PurchaseRepository purchaseRepository;

    @Autowired
    private PayablePaymentRecordRepository paymentRecordRepository;

    @PutMapping("/{id}")
    public ResponseEntity<Supplier> updateSupplier(@PathVariable Long id, @RequestBody Supplier supplierDetails) {
        Optional<Supplier> supplierOpt = supplierRepository.findById(id);
        if (supplierOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Supplier supplier = supplierOpt.get();

        String oldName = supplier.getName();
        String newName = supplierDetails.getName();
        
        supplier.setName(newName);
        supplier.setIdentification(supplierDetails.getIdentification());
        supplier.setContactPerson(supplierDetails.getContactPerson());
        supplier.setEmail(supplierDetails.getEmail());
        supplier.setPhone(supplierDetails.getPhone());
        supplier.setAddress(supplierDetails.getAddress());

        Supplier updatedSupplier = supplierRepository.save(supplier);

        // 1. Update payables already linked by ID (Normal case)
        List<com.agropecuariopos.backend.models.AccountPayable> payablesById =
                accountPayableRepository.findBySupplierId(id);
        for (com.agropecuariopos.backend.models.AccountPayable payable : payablesById) {
            payable.setSupplierName(newName);
            accountPayableRepository.save(payable);
        }

        // 2. Catch legacy payables that were only linked by name (Orphaned/Legacy case)
        // We use IgnoreCase to be as robust as possible.
        List<com.agropecuariopos.backend.models.AccountPayable> orphanedPayables =
                accountPayableRepository.findBySupplierNameIgnoreCase(oldName);
        for (com.agropecuariopos.backend.models.AccountPayable orphaned : orphanedPayables) {
            // Link them to the ID if they weren't already (or update if they were)
            orphaned.setSupplierId(id);
            orphaned.setSupplierName(newName);
            accountPayableRepository.save(orphaned);
        }

        return ResponseEntity.ok(updatedSupplier);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSupplier(@PathVariable Long id) {
        if (!supplierRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        supplierRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/history")
    @Nullable
    public SupplierHistoryDTO getSupplierHistory(@PathVariable Long id) {
        Optional<Supplier> supplierOpt = supplierRepository.findById(id);
        if (supplierOpt.isEmpty()) {
            return null;
        }

        Supplier supplier = supplierOpt.get();
        List<Purchase> purchases = purchaseRepository.findBySupplier(supplier);

        BigDecimal totalPurchases = BigDecimal.ZERO;
        BigDecimal totalPaid = BigDecimal.ZERO;
        List<SupplierHistoryDTO.TransactionHistoryItemDTO> transactionHistory = new ArrayList<>();
        java.util.Set<Long> processedPayables = new java.util.HashSet<>();

        for (Purchase purchase : purchases) {
            totalPurchases = totalPurchases.add(purchase.getTotalAmount());

            BigDecimal amountPaid = BigDecimal.ZERO;
            String status = "PAID_IN_FULL";

            if (purchase.getPaymentMethod() == Purchase.PaymentMethod.CREDIT) {
                // Find associated account payable
                // For CREDIT purchases, we use invoice details or similar, but the easiest is finding any matching payables.
                // It might not be a 1:1 mapping easily if only InvoiceNumber is used. But we can query payables by invoice number.
                List<AccountPayable> payables = accountPayableRepository.findBySupplierId(id);
                // Try to find exact one
                Optional<AccountPayable> payableOpt = payables.stream()
                        .filter(p -> !processedPayables.contains(p.getId()) && p.getSupplierInvoiceReference() != null && p.getSupplierInvoiceReference().equals(purchase.getInvoiceNumber()))
                        .findFirst();

                if (payableOpt.isPresent()) {
                    AccountPayable payable = payableOpt.get();
                    processedPayables.add(payable.getId());
                    amountPaid = payable.getAmountPaid();
                    status = payable.getStatus().toString();
                    totalPaid = totalPaid.add(amountPaid);

                    // Add payments
                    List<PayablePaymentRecord> payments = paymentRecordRepository.findByAccountPayableId(payable.getId());
                    for (PayablePaymentRecord payment : payments) {
                        transactionHistory.add(new SupplierHistoryDTO.TransactionHistoryItemDTO(
                                payment.getId(),
                                "ABONO-" + payment.getId(),
                                payment.getPaymentDate(),
                                "CASH",
                                payment.getAmount(),
                                payment.getAmount(),
                                payment.getNewBalance(),
                                "COMPLETED",
                                SupplierHistoryDTO.TransactionType.PAYMENT,
                                null,
                                purchase.getInvoiceNumber(),
                                null
                        ));
                    }
                } else {
                    // Fallback to PAID if no payable is found or maybe it wasn't tracked right
                    amountPaid = purchase.getTotalAmount();
                    totalPaid = totalPaid.add(amountPaid);
                }
            } else {
                // CASH purchase
                amountPaid = purchase.getTotalAmount();
                totalPaid = totalPaid.add(amountPaid);
            }

            BigDecimal remainingBalance = purchase.getTotalAmount().subtract(amountPaid);

            List<SupplierHistoryDTO.PurchaseItemDetailDTO> items = purchase.getItems().stream()
                    .map(item -> new SupplierHistoryDTO.PurchaseItemDetailDTO(
                            item.getProduct().getName(),
                            item.getQuantity(),
                            item.getCostPrice(),
                            item.getLineTotal()
                    )).collect(Collectors.toList());

            transactionHistory.add(new SupplierHistoryDTO.TransactionHistoryItemDTO(
                    purchase.getId(),
                    purchase.getInvoiceNumber(),
                    purchase.getCreatedDate(),
                    purchase.getPaymentMethod().toString(),
                    purchase.getTotalAmount(),
                    amountPaid,
                    remainingBalance,
                    status,
                    SupplierHistoryDTO.TransactionType.PURCHASE,
                    items,
                    null,
                    BigDecimal.ZERO // no discount for purchase items tracked right now
            ));
        }

        transactionHistory.sort(Comparator.comparing(SupplierHistoryDTO.TransactionHistoryItemDTO::getDate).reversed());
        BigDecimal totalPending = totalPurchases.subtract(totalPaid);

        return new SupplierHistoryDTO(
                supplier.getId(),
                supplier.getName(),
                supplier.getIdentification(),
                totalPurchases,
                totalPaid,
                totalPending,
                transactionHistory
        );
    }
}
