package com.agropecuariopos.backend.dto;

import com.agropecuariopos.backend.models.Sale;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class SaleRequest {

    @NotNull
    private Sale.PaymentMethod paymentMethod;

    private String clientName;
    private String clientIdentification;

    @DecimalMin("0.0")
    private BigDecimal totalDiscount;
    // Client requested exemption string from Hacienda
    private String exonetAuthorizationCode;

    @NotEmpty
    private List<SaleItemRequest> items;

    @Getter
    @Setter
    public static class SaleItemRequest {

        @NotNull
        private Long productId;

        @NotNull
        private Integer quantity;

        @DecimalMin("0.0")
        private BigDecimal customDiscount;
    }
}
