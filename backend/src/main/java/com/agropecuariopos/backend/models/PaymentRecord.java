package com.agropecuariopos.backend.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.envers.Audited;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_records")
@Getter
@Setter
@Audited
public class PaymentRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_receivable_id", nullable = false)
    private AccountReceivable accountReceivable;

    @NotNull
    @DecimalMin("0.0")
    @Column(precision = 12, scale = 2)
    private BigDecimal amount;

    @NotNull
    private LocalDateTime paymentDate;

    // To track the balances before and after the payment
    @Column(precision = 12, scale = 2)
    private BigDecimal previousBalance;

    @Column(precision = 12, scale = 2)
    private BigDecimal newBalance;

    /** Medio de pago del abono: CASH, CARD, SINPE_MOVIL, TRANSFER, etc. */
    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private PaymentMethod paymentMethod;

    public enum PaymentMethod {
        CASH, CARD, SINPE_MOVIL, TRANSFER
    }
}
