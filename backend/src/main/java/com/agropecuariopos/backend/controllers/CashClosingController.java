package com.agropecuariopos.backend.controllers;

import com.agropecuariopos.backend.dto.CashClosingDTO;
import com.agropecuariopos.backend.models.CashClosing;
import com.agropecuariopos.backend.models.PaymentRecord;
import com.agropecuariopos.backend.models.Sale;
import com.agropecuariopos.backend.repositories.CashClosingRepository;
import com.agropecuariopos.backend.repositories.DailyExpenseRepository;
import com.agropecuariopos.backend.repositories.PaymentRecordRepository;
import com.agropecuariopos.backend.repositories.SaleRepository;
import com.agropecuariopos.backend.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cash-closing")
public class CashClosingController {

    @Autowired private SaleRepository saleRepository;
    @Autowired private PaymentRecordRepository paymentRecordRepository;
    @Autowired private DailyExpenseRepository dailyExpenseRepository;
    @Autowired private CashClosingRepository cashClosingRepository;

    // ─── Preview: compute today's numbers without saving ────────────────────────
    @GetMapping("/preview")
    public CashClosingDTO previewToday(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime hasta) {
        LocalDateTime s = desde != null ? desde : LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime e = hasta != null ? hasta : LocalDateTime.of(LocalDate.now(), LocalTime.MAX);
        return buildReport(s, e, null, false);
    }

    // ─── Confirm: compute + save to DB ──────────────────────────────────────────
    @PostMapping
    public CashClosingDTO closeCashRegister(
            @RequestParam(required = false) String notes,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime hasta) {
        LocalDateTime s = desde != null ? desde : LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime e = hasta != null ? hasta : LocalDateTime.of(LocalDate.now(), LocalTime.MAX);
        return buildReport(s, e, notes, true);
    }

    // ─── History ─────────────────────────────────────────────────────────────────
    @GetMapping
    public List<CashClosingDTO> getHistory() {
        return cashClosingRepository.findAllByOrderByClosingDateDesc()
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    // ─── Get single ──────────────────────────────────────────────────────────────
    @GetMapping("/{id}")
    public CashClosingDTO getById(@PathVariable Long id) {
        return cashClosingRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Cierre no encontrado"));
    }

    // ─── Core logic ──────────────────────────────────────────────────────────────
    private CashClosingDTO buildReport(LocalDateTime start, LocalDateTime end, String notes, boolean save) {

        // 1. Sales for the day (COMPLETED only)
        List<Sale> sales = saleRepository.findByCreatedDateBetween(start, end)
                .stream()
                .filter(s -> s.getStatus() == Sale.SaleStatus.COMPLETED)
                .collect(Collectors.toList());

        BigDecimal totalCash     = BigDecimal.ZERO;
        BigDecimal totalCard     = BigDecimal.ZERO;
        BigDecimal totalSinpe    = BigDecimal.ZERO;
        BigDecimal totalCredit   = BigDecimal.ZERO;
        BigDecimal totalRevenue  = BigDecimal.ZERO;
        BigDecimal totalDiscount = BigDecimal.ZERO;
        BigDecimal totalTax      = BigDecimal.ZERO;
        BigDecimal totalGrossProfit = BigDecimal.ZERO;

        for (Sale sale : sales) {
            BigDecimal amount = sale.getFinalTotal() != null ? sale.getFinalTotal() : BigDecimal.ZERO;
            totalRevenue = totalRevenue.add(amount);

            if (sale.getTotalDiscount() != null)
                totalDiscount = totalDiscount.add(sale.getTotalDiscount());
            if (sale.getTotalTax() != null)
                totalTax = totalTax.add(sale.getTotalTax());
            if (sale.getTotalGrossProfit() != null)
                totalGrossProfit = totalGrossProfit.add(sale.getTotalGrossProfit());

            switch (sale.getPaymentMethod()) {
                case CASH -> totalCash = totalCash.add(amount);
                case CARD -> totalCard = totalCard.add(amount);
                case SINPE_MOVIL, SIMPE_MOVIL -> totalSinpe = totalSinpe.add(amount);
                case CREDIT -> totalCredit = totalCredit.add(amount);
                default -> {}
            }
        }

        // 2. Abonos received today
        List<PaymentRecord> payments = paymentRecordRepository.findByPaymentDateBetween(start, end);
        BigDecimal totalPaymentsReceived = BigDecimal.ZERO;
        
        for (PaymentRecord payment : payments) {
            BigDecimal amount = payment.getAmount() != null ? payment.getAmount() : BigDecimal.ZERO;
            totalPaymentsReceived = totalPaymentsReceived.add(amount);
            
            if (payment.getPaymentMethod() != null) {
                switch (payment.getPaymentMethod()) {
                    case CASH -> totalCash = totalCash.add(amount);
                    case CARD -> totalCard = totalCard.add(amount);
                    case SINPE_MOVIL -> totalSinpe = totalSinpe.add(amount);
                    default -> totalCash = totalCash.add(amount);
                }
            } else {
                totalCash = totalCash.add(amount);
            }
        }

        // 3. Expenses for the day
        List<com.agropecuariopos.backend.models.DailyExpense> dailyExpenses = dailyExpenseRepository.findByRegisteredDateBetween(start, end);
        BigDecimal totalExpenses = BigDecimal.ZERO;
        BigDecimal totalCashExpense = BigDecimal.ZERO;
        BigDecimal totalCardExpense = BigDecimal.ZERO;
        BigDecimal totalSinpeExpense = BigDecimal.ZERO;

        for (com.agropecuariopos.backend.models.DailyExpense exp : dailyExpenses) {
            if (Boolean.TRUE.equals(exp.getIsDeductibleFromProfit())) {
                BigDecimal amount = exp.getAmount() != null ? exp.getAmount() : BigDecimal.ZERO;
                totalExpenses = totalExpenses.add(amount);
                if (exp.getPaymentMethod() != null) {
                    switch (exp.getPaymentMethod()) {
                        case CASH -> totalCashExpense = totalCashExpense.add(amount);
                        case CARD -> totalCardExpense = totalCardExpense.add(amount);
                        case SINPE_MOVIL -> totalSinpeExpense = totalSinpeExpense.add(amount);
                        default -> totalCashExpense = totalCashExpense.add(amount);
                    }
                } else {
                    totalCashExpense = totalCashExpense.add(amount);
                }
            }
        }

        // 4. Net cash (liquid collected: cash + sinpe + card - expenses)
        BigDecimal netCash = totalCash
                .add(totalCard)
                .add(totalSinpe)
                .subtract(totalExpenses);

        // 5. Get who is doing the closing
        String closedBy = "Sistema";
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof UserDetailsImpl ud) {
                closedBy = ud.getUsername();
            }
        } catch (Exception ignored) {}

        // 6. Optionally persist
        if (save) {
            CashClosing closing = new CashClosing();
            closing.setClosingDate(LocalDateTime.now());
            closing.setClosedBy(closedBy);
            closing.setTotalCash(totalCash);
            closing.setTotalCard(totalCard);
            closing.setTotalSinpe(totalSinpe);
            closing.setTotalCredit(totalCredit);
            closing.setTotalPaymentsReceived(totalPaymentsReceived);
            closing.setTotalRevenue(totalRevenue);
            closing.setTotalDiscount(totalDiscount);
            closing.setTotalTax(totalTax);
            closing.setTotalGrossProfit(totalGrossProfit);
            closing.setTotalExpenses(totalExpenses);
            closing.setTotalCashExpense(totalCashExpense);
            closing.setTotalCardExpense(totalCardExpense);
            closing.setTotalSinpeExpense(totalSinpeExpense);
            closing.setNetCash(netCash);
            closing.setNumberOfSales(sales.size());
            closing.setNumberOfPayments(payments.size());
            closing.setNotes(notes);
            cashClosingRepository.save(closing);
        }

        return new CashClosingDTO(
                null,
                LocalDateTime.now(),
                closedBy,
                totalCash, totalCard, totalSinpe, totalCredit,
                totalPaymentsReceived,
                totalRevenue, totalDiscount, totalTax, totalGrossProfit,
                totalExpenses, totalCashExpense, totalCardExpense, totalSinpeExpense, netCash,
                sales.size(), payments.size(),
                notes
        );
    }

    private CashClosingDTO toDTO(CashClosing c) {
        return new CashClosingDTO(
                c.getId(), c.getClosingDate(), c.getClosedBy(),
                c.getTotalCash(), c.getTotalCard(), c.getTotalSinpe(), c.getTotalCredit(),
                c.getTotalPaymentsReceived(),
                c.getTotalRevenue(), c.getTotalDiscount(), c.getTotalTax(), c.getTotalGrossProfit(),
                c.getTotalExpenses(), 
                c.getTotalCashExpense() != null ? c.getTotalCashExpense() : BigDecimal.ZERO,
                c.getTotalCardExpense() != null ? c.getTotalCardExpense() : BigDecimal.ZERO,
                c.getTotalSinpeExpense() != null ? c.getTotalSinpeExpense() : BigDecimal.ZERO,
                c.getNetCash(),
                c.getNumberOfSales(), c.getNumberOfPayments(),
                c.getNotes()
        );
    }
}
