package com.agropecuariopos.backend.repositories;

import com.agropecuariopos.backend.models.PaymentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PaymentRecordRepository extends JpaRepository<PaymentRecord, Long> {
    List<PaymentRecord> findByAccountReceivableIdOrderByPaymentDateDesc(Long accountReceivableId);
    List<PaymentRecord> findByPaymentDateBetween(LocalDateTime start, LocalDateTime end);
}
