package com.agropecuariopos.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class SaleResponse {

    private Long id;
    private String invoiceNumber;
    private String paymentMethod;
    private String status;
    private BigDecimal subtotal;
    private BigDecimal totalTax;
    private BigDecimal finalTotal;
    private String clientName;
    private LocalDateTime createdDate;
}
