package com.agropecuariopos.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class CashClosingDTO {

    private Long id;
    private LocalDateTime closingDate;
    private String closedBy;

    // Revenue by method
    private BigDecimal totalCash;
    private BigDecimal totalCard;
    private BigDecimal totalSinpe;
    private BigDecimal totalCredit;
    private BigDecimal totalPaymentsReceived;

    // Totals
    private BigDecimal totalRevenue;
    private BigDecimal totalDiscount;
    private BigDecimal totalTax;
    private BigDecimal totalGrossProfit;
    private BigDecimal totalExpenses;
    private BigDecimal netCash;

    // Counts
    private Integer numberOfSales;
    private Integer numberOfPayments;

    private String notes;
}
