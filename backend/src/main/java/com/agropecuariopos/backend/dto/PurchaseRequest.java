package com.agropecuariopos.backend.dto;

import com.agropecuariopos.backend.models.Purchase;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class PurchaseRequest {

    @NotNull
    private Purchase.PaymentMethod paymentMethod;

    private Long supplierId;
    private String invoiceNumber;
    private String description;

    @DecimalMin("0.0")
    private BigDecimal totalAmount;

    @NotEmpty
    private List<PurchaseItemRequest> items;

    @Getter
    @Setter
    public static class PurchaseItemRequest {
        @NotNull
        private Long productId;

        @NotNull
        private Integer quantity;

        @NotNull
        @DecimalMin("0.0")
        private BigDecimal costPrice;
    }
}
