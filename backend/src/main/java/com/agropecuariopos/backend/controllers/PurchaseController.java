package com.agropecuariopos.backend.controllers;

import com.agropecuariopos.backend.dto.PurchaseRequest;
import com.agropecuariopos.backend.models.Purchase;
import com.agropecuariopos.backend.models.Supplier;
import com.agropecuariopos.backend.repositories.PurchaseRepository;
import com.agropecuariopos.backend.repositories.SupplierRepository;
import com.agropecuariopos.backend.services.PurchaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchases")

public class PurchaseController {

    @Autowired
    private PurchaseService purchaseService;

    @Autowired
    private PurchaseRepository purchaseRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @PostMapping
    public ResponseEntity<Purchase> createPurchase(@RequestBody PurchaseRequest request) {
        return ResponseEntity.ok(purchaseService.createPurchase(request));
    }

    @GetMapping
    public List<Purchase> getAllPurchases() {
        return purchaseRepository.findAll();
    }

    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<List<Purchase>> getPurchasesBySupplier(@PathVariable Long supplierId) {
        return supplierRepository.findById(supplierId)
                .map(supplier -> ResponseEntity.ok(purchaseRepository.findBySupplier(supplier)))
                .orElse(ResponseEntity.notFound().build());
    }
}
