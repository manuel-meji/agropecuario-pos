package com.agropecuariopos.backend.repositories;

import com.agropecuariopos.backend.models.Purchase;
import com.agropecuariopos.backend.models.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseRepository extends JpaRepository<Purchase, Long> {
    List<Purchase> findBySupplier(Supplier supplier);
}
