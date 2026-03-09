package com.agropecuariopos.backend.repositories;

import com.agropecuariopos.backend.models.PayablePaymentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PayablePaymentRecordRepository extends JpaRepository<PayablePaymentRecord, Long> {
    List<PayablePaymentRecord> findByAccountPayableId(Long accountPayableId);
}
