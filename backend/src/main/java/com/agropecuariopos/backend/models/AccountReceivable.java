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
@Table(name = "accounts_receivable")
@Getter
@Setter
@Audited
public class AccountReceivable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relación directa de qué factura provocó la deuda si aplica (Null si es saldo
    // a favor)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sale_id")
    private Sale relatedSale;

    @NotNull
    private String clientName;

    private String clientPhone;

    @NotNull
    @DecimalMin("0.0")
    @Column(precision = 12, scale = 2)
    private BigDecimal totalDebt;

    // Saldo abonos acumulativos
    @NotNull
    @DecimalMin("0.0")
    @Column(precision = 12, scale = 2)
    private BigDecimal amountPaid;

    @NotNull
    @Enumerated(EnumType.STRING)
    private DebtStatus status;

    private LocalDateTime dueDate;

    public enum DebtStatus {
        PENDING, PARTIAL, PAID_IN_FULL, DEFAULTED
    }

    public BigDecimal getRemainingBalance() {
        return totalDebt.subtract(amountPaid);
    }
}
