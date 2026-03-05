package com.agropecuariopos.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class SaleItemRequest {

    @NotNull
    private Long productId;

    @NotNull
    private Integer quantity;
    
    private Integer qty; // alias para compatibilidad

    @DecimalMin("0.0")
    private BigDecimal customDiscount;
    
    // getter para qty
    public int getQty() {
        return qty != null ? qty : (quantity != null ? quantity : 0);
    }
}
