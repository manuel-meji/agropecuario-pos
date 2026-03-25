package com.agropecuariopos.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;



@Getter
@Setter
public class PaymentRequest {

    @NotNull
    @DecimalMin("0.01")
    private Double amount;
}
