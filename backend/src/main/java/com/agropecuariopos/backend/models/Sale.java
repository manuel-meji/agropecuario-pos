package com.agropecuariopos.backend.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.envers.Audited;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sales")
@Getter
@Setter
@Audited
@EntityListeners(AuditingEntityListener.class)
public class Sale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String invoiceNumber;

    @NotNull
    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    @NotNull
    @Enumerated(EnumType.STRING)
    private SaleStatus status;

    @DecimalMin("0.0")
    @Column(precision = 12, scale = 2)
    private BigDecimal subtotal;

    @DecimalMin("0.0")
    @Column(precision = 12, scale = 2)
    private BigDecimal totalDiscount;

    @DecimalMin("0.0")
    @Column(precision = 12, scale = 2)
    private BigDecimal totalTax;

    @DecimalMin("0.0")
    @Column(precision = 12, scale = 2)
    private BigDecimal finalTotal;

    // Financial Analysis Field (Stored at Sale time, unchangeable)
    // NOTE: Can be negative if discounts exceed the profit margin (valid scenario)
    @Column(precision = 12, scale = 2)
    private BigDecimal totalGrossProfit;

    // Identification (Receiver ID for CR Tributation)
    private String clientName;
    private String clientIdentification; // optional

    @Column(length = 100)
    private String sellerName; // Name of the user who made the sale

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_client")
    @org.hibernate.envers.Audited(targetAuditMode = org.hibernate.envers.RelationTargetAuditMode.NOT_AUDITED)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Client client;

    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SaleItem> items = new ArrayList<>();

    // Auditor Controls
    @CreatedBy
    @Column(updatable = false)
    private String createdBy;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdDate;

    public enum PaymentMethod {
        CASH, CARD, TRANSFER, CREDIT, SIMPE_MOVIL, SINPE_MOVIL
    }

    public enum SaleStatus {
        COMPLETED, CANCELLED, CONTINGENCY_PENDING, PARTIAL
    }
}
