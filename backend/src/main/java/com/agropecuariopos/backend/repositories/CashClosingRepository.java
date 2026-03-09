package com.agropecuariopos.backend.repositories;

import com.agropecuariopos.backend.models.CashClosing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CashClosingRepository extends JpaRepository<CashClosing, Long> {
    List<CashClosing> findAllByOrderByClosingDateDesc();
    List<CashClosing> findByClosingDateBetweenOrderByClosingDateDesc(LocalDateTime start, LocalDateTime end);
}
