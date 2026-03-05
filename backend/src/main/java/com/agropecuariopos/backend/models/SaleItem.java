package com.agropecuariopos.backend.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.envers.Audited;

import java.math.BigDecimal;

@Entity
@Table(name = "sale_items")
@Getter
@Setter
@Audited
public class SaleItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sale_id", nullable = false)
    @JsonIgnore
    private Sale sale;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private Product product;

    @NotNull
    @Min(1)
    private Integer quantity;

    @DecimalMin("0.0")
    @Column(precision = 12, scale = 2)
    private BigDecimal unitPriceAtSale;

    @DecimalMin("0.0")
    @Column(precision = 12, scale = 2)
    private BigDecimal unitCostAtSale; // To definitively calculate Profit Freezes Context

    @DecimalMin("0.0")
    @Column(precision = 12, scale = 2)
    private BigDecimal itemDiscount;

    @DecimalMin("0.0")
    @Column(precision = 12, scale = 2)
    private BigDecimal itemTax;

    @DecimalMin("0.0")
    @Column(precision = 12, scale = 2)
    private BigDecimal lineTotal;
}
