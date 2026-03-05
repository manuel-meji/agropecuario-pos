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

    private Long clientId;
    private String clientName;
    private String clientIdentification;

    @DecimalMin("0.0")
    private BigDecimal totalDiscount;

    private double subtotal;
    private double tax;
    private double total;

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

        private Integer qty; // alias para compatibilidad

        @DecimalMin("0.0")
        private BigDecimal customDiscount;

        // getter para qty
        public int getQty() {
            if (qty != null) {
                return qty;
            } else if (quantity != null) {
                return quantity;
            }
            return 0;
        }
    }
}
