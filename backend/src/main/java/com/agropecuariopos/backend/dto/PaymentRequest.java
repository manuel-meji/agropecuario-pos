package com.agropecuariopos.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import com.agropecuariopos.backend.models.PaymentRecord;

@Getter
@Setter
public class PaymentRequest {

    @NotNull
    @DecimalMin("0.01")
    private Double amount;

    /** Medio de pago: CASH, CARD, SINPE_MOVIL, TRANSFER, CHECK, OTHER */
    private PaymentRecord.PaymentMethod paymentMethod;
}

