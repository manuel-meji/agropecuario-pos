package com.agropecuariopos.backend.controllers;

import com.agropecuariopos.backend.models.Supplier;
import com.agropecuariopos.backend.repositories.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;
import java.util.List;

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
}
