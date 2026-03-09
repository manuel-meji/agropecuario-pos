package com.agropecuariopos.backend.repositories;

import com.agropecuariopos.backend.models.AccountPayable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccountPayableRepository extends JpaRepository<AccountPayable, Long> {
    List<AccountPayable> findBySupplierName(String supplierName);
}
