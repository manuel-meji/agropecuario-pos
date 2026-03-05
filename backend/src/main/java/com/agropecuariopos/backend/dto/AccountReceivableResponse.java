package com.agropecuariopos.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class AccountReceivableResponse {

    private Long id;
    private String invoiceNumber;
    private String clientName;
    private String clientPhone;
    private BigDecimal totalDebt;
    private BigDecimal amountPaid;
    private BigDecimal remainingBalance;
    private String status;
    private LocalDateTime dueDate;
}
