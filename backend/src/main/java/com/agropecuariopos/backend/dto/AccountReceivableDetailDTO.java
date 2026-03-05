package com.agropecuariopos.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class AccountReceivableDetailDTO {

    private Long id;
    private String invoiceNumber;
    private LocalDateTime saleDate;
    private BigDecimal totalDebt;
    private BigDecimal amountPaid;
    private BigDecimal remainingBalance;
    private String status;
    private LocalDateTime dueDate;

    public AccountReceivableDetailDTO() {
    }

    public AccountReceivableDetailDTO(Long id, String invoiceNumber, LocalDateTime saleDate,
            BigDecimal totalDebt, BigDecimal amountPaid,
            BigDecimal remainingBalance, String status, LocalDateTime dueDate) {
        this.id = id;
        this.invoiceNumber = invoiceNumber;
        this.saleDate = saleDate;
        this.totalDebt = totalDebt;
        this.amountPaid = amountPaid;
        this.remainingBalance = remainingBalance;
        this.status = status;
        this.dueDate = dueDate;
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public void setInvoiceNumber(String invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
    }

    public LocalDateTime getSaleDate() {
        return saleDate;
    }

    public void setSaleDate(LocalDateTime saleDate) {
        this.saleDate = saleDate;
    }

    public BigDecimal getTotalDebt() {
        return totalDebt;
    }

    public void setTotalDebt(BigDecimal totalDebt) {
        this.totalDebt = totalDebt;
    }

    public BigDecimal getAmountPaid() {
        return amountPaid;
    }

    public void setAmountPaid(BigDecimal amountPaid) {
        this.amountPaid = amountPaid;
    }

    public BigDecimal getRemainingBalance() {
        return remainingBalance;
    }

    public void setRemainingBalance(BigDecimal remainingBalance) {
        this.remainingBalance = remainingBalance;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDateTime dueDate) {
        this.dueDate = dueDate;
    }
}
