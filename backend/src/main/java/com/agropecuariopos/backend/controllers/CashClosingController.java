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
    public CashClosingDTO previewToday() {
        return buildReport(
                LocalDateTime.of(LocalDate.now(), LocalTime.MIN),
                LocalDateTime.of(LocalDate.now(), LocalTime.MAX),
                null,
                false
        );
    }

    // ─── Confirm: compute + save to DB ──────────────────────────────────────────
    @PostMapping
    public CashClosingDTO closeCashRegister(@RequestParam(required = false) String notes) {
        return buildReport(
                LocalDateTime.of(LocalDate.now(), LocalTime.MIN),
                LocalDateTime.of(LocalDate.now(), LocalTime.MAX),
                notes,
                true
        );
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
                case CASH         -> totalCash   = totalCash.add(amount);
                case CARD         -> totalCard   = totalCard.add(amount);
                // Handle both SINPE_MOVIL variants
                case SINPE_MOVIL, SIMPE_MOVIL -> totalSinpe = totalSinpe.add(amount);
                case CREDIT       -> totalCredit = totalCredit.add(amount);
                default -> {}
            }
        }

        // 2. Abonos received today
        List<PaymentRecord> payments = paymentRecordRepository.findByPaymentDateBetween(start, end);
        BigDecimal totalPaymentsReceived = payments.stream()
                .map(PaymentRecord::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 3. Expenses for the day
        BigDecimal totalExpenses = dailyExpenseRepository
                .sumDeductibleExpensesBetweenDates(start, end);
        if (totalExpenses == null) totalExpenses = BigDecimal.ZERO;

        // 4. Net cash (liquid collected: cash + sinpe + card + abonos - expenses)
        BigDecimal netCash = totalCash
                .add(totalCard)
                .add(totalSinpe)
                .add(totalPaymentsReceived)
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
                totalExpenses, netCash,
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
                c.getTotalExpenses(), c.getNetCash(),
                c.getNumberOfSales(), c.getNumberOfPayments(),
                c.getNotes()
        );
    }
}
