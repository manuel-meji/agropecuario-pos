package com.agropecuariopos.backend.dto;

import java.math.BigDecimal;
import java.util.List;

public class ClientReceivableDTO {

    private Long clientId;
    private String clientName;
    private String clientPhone;
    private BigDecimal totalDebtAmount;
    private BigDecimal totalPaidAmount;
    private BigDecimal totalRemainingBalance;
    private String generalStatus; // PAID_IN_FULL, PARTIAL, PENDING
    private List<AccountReceivableDetailDTO> receivables;

    public ClientReceivableDTO() {
    }

    public ClientReceivableDTO(Long clientId, String clientName, String clientPhone,
            BigDecimal totalDebtAmount, BigDecimal totalPaidAmount,
            BigDecimal totalRemainingBalance, String generalStatus,
            List<AccountReceivableDetailDTO> receivables) {
        this.clientId = clientId;
        this.clientName = clientName;
        this.clientPhone = clientPhone;
        this.totalDebtAmount = totalDebtAmount;
        this.totalPaidAmount = totalPaidAmount;
        this.totalRemainingBalance = totalRemainingBalance;
        this.generalStatus = generalStatus;
        this.receivables = receivables;
    }

    // Getters y Setters
    public Long getClientId() {
        return clientId;
    }

    public void setClientId(Long clientId) {
        this.clientId = clientId;
    }

    public String getClientName() {
        return clientName;
    }

    public void setClientName(String clientName) {
        this.clientName = clientName;
    }

    public String getClientPhone() {
        return clientPhone;
    }

    public void setClientPhone(String clientPhone) {
        this.clientPhone = clientPhone;
    }

    public BigDecimal getTotalDebtAmount() {
        return totalDebtAmount;
    }

    public void setTotalDebtAmount(BigDecimal totalDebtAmount) {
        this.totalDebtAmount = totalDebtAmount;
    }

    public BigDecimal getTotalPaidAmount() {
        return totalPaidAmount;
    }

    public void setTotalPaidAmount(BigDecimal totalPaidAmount) {
        this.totalPaidAmount = totalPaidAmount;
    }

    public BigDecimal getTotalRemainingBalance() {
        return totalRemainingBalance;
    }

    public void setTotalRemainingBalance(BigDecimal totalRemainingBalance) {
        this.totalRemainingBalance = totalRemainingBalance;
    }

    public String getGeneralStatus() {
        return generalStatus;
    }

    public void setGeneralStatus(String generalStatus) {
        this.generalStatus = generalStatus;
    }

    public List<AccountReceivableDetailDTO> getReceivables() {
        return receivables;
    }

    public void setReceivables(List<AccountReceivableDetailDTO> receivables) {
        this.receivables = receivables;
    }
}
