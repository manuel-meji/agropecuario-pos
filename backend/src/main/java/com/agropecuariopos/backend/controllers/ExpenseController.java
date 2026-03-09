package com.agropecuariopos.backend.controllers;

import com.agropecuariopos.backend.models.DailyExpense;
import com.agropecuariopos.backend.repositories.DailyExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    @Autowired
    private DailyExpenseRepository expenseRepository;

    @GetMapping
    public List<DailyExpense> getAll(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate
    ) {
        if (startDate != null && endDate != null) {
            LocalDateTime start = LocalDate.parse(startDate).atStartOfDay();
            LocalDateTime end = LocalDate.parse(endDate).atTime(LocalTime.MAX);
            return expenseRepository.findAll().stream()
                    .filter(e -> e.getRegisteredDate() != null &&
                            !e.getRegisteredDate().isBefore(start) &&
                            !e.getRegisteredDate().isAfter(end))
                    .sorted((a, b) -> b.getRegisteredDate().compareTo(a.getRegisteredDate()))
                    .toList();
        }
        return expenseRepository.findAll().stream()
                .sorted((a, b) -> b.getRegisteredDate().compareTo(a.getRegisteredDate()))
                .toList();
    }

    @PostMapping
    public DailyExpense create(@RequestBody DailyExpense expense) {
        return expenseRepository.save(expense);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DailyExpense> update(@PathVariable Long id, @RequestBody DailyExpense updated) {
        return expenseRepository.findById(id).map(e -> {
            e.setDescription(updated.getDescription());
            e.setCategory(updated.getCategory());
            e.setAmount(updated.getAmount());
            e.setIsDeductibleFromProfit(updated.getIsDeductibleFromProfit());
            return ResponseEntity.ok(expenseRepository.save(e));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!expenseRepository.existsById(id)) return ResponseEntity.notFound().build();
        expenseRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/summary/today")
    public Map<String, Object> todaySummary() {
        LocalDateTime start = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime end = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);
        BigDecimal total = expenseRepository.sumDeductibleExpensesBetweenDates(start, end);
        long count = expenseRepository.findAll().stream()
                .filter(e -> e.getRegisteredDate() != null &&
                        !e.getRegisteredDate().isBefore(start) &&
                        !e.getRegisteredDate().isAfter(end))
                .count();
        return Map.of("totalToday", total != null ? total : BigDecimal.ZERO, "countToday", count);
    }
}
