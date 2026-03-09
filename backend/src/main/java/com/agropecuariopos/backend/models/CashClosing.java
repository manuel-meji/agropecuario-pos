package com.agropecuariopos.backend.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "cash_closings")
@Getter
@Setter
@NoArgsConstructor
public class CashClosing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime closingDate;

    private String closedBy;

    // ─── Revenue by payment method ───────────────────────────
    @Column(precision = 14, scale = 2)
    private BigDecimal totalCash = BigDecimal.ZERO;

    @Column(precision = 14, scale = 2)
    private BigDecimal totalCard = BigDecimal.ZERO;

    @Column(precision = 14, scale = 2)
    private BigDecimal totalSinpe = BigDecimal.ZERO;

    @Column(precision = 14, scale = 2)
    private BigDecimal totalCredit = BigDecimal.ZERO;

    // ─── Abonos (payments collected on receivables) ─────────
    @Column(precision = 14, scale = 2)
    private BigDecimal totalPaymentsReceived = BigDecimal.ZERO;

    // ─── Sales summary ────────────────────────────────────────
    @Column(precision = 14, scale = 2)
    private BigDecimal totalRevenue = BigDecimal.ZERO;      // sum finalTotal all sales

    @Column(precision = 14, scale = 2)
    private BigDecimal totalDiscount = BigDecimal.ZERO;

    @Column(precision = 14, scale = 2)
    private BigDecimal totalTax = BigDecimal.ZERO;

    @Column(precision = 14, scale = 2)
    private BigDecimal totalGrossProfit = BigDecimal.ZERO;

    // ─── Expenses ─────────────────────────────────────────────
    @Column(precision = 14, scale = 2)
    private BigDecimal totalExpenses = BigDecimal.ZERO;

    // ─── Net ─────────────────────────────────────────────────
    @Column(precision = 14, scale = 2)
    private BigDecimal netCash = BigDecimal.ZERO;   // cash + sinpe + card - expenses

    // ─── Counts ──────────────────────────────────────────────
    private Integer numberOfSales = 0;
    private Integer numberOfPayments = 0;

    // Optional notes
    @Column(length = 1000)
    private String notes;
}
