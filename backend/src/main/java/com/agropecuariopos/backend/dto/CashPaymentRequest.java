package com.agropecuariopos.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CashPaymentRequest {

    @NotNull
    @DecimalMin("0.0")
    private BigDecimal totalAmount; // Monto total de la venta

    @NotNull
    @DecimalMin("0.0")
    private BigDecimal amountPaid; // Monto con el que se está pagando
}
