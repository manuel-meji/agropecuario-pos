package com.agropecuariopos.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRecordDTO {
    private Long id;
    private Long accountReceivableId;
    private String clientName;
    private String invoiceNumber;
    private BigDecimal amount;
    private LocalDateTime paymentDate;
    private BigDecimal previousBalance;
    private BigDecimal newBalance;
}
