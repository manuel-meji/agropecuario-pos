package com.agropecuariopos.backend.repositories;

import com.agropecuariopos.backend.models.DailyExpense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Repository
public interface DailyExpenseRepository extends JpaRepository<DailyExpense, Long> {

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM DailyExpense e WHERE e.isDeductibleFromProfit = true AND e.registeredDate BETWEEN :startDate AND :endDate")
    BigDecimal sumDeductibleExpensesBetweenDates(@Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    java.util.List<DailyExpense> findByRegisteredDateBetween(LocalDateTime startDate, LocalDateTime endDate);
}
