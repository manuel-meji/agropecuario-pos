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
@Table(name = "accounts_payable")
@Getter
@Setter
@Audited
public class AccountPayable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    private String supplierName;

    // Referencias de facturas del proveedor para contabilidad
    private String supplierInvoiceReference;

    @NotNull
    @DecimalMin("0.0")
    @Column(precision = 12, scale = 2)
    private BigDecimal totalDebt;

    @NotNull
    @DecimalMin("0.0")
    @Column(precision = 12, scale = 2)
    private BigDecimal amountPaid;

    @NotNull
    @Enumerated(EnumType.STRING)
    private PayableStatus status;

    private LocalDateTime dueDate;

    // To optionally trigger FEC creation (Factura Electrónica de Compra) Si es
    // régimen simplificado
    private Boolean requiresFEC;

    public enum PayableStatus {
        PENDING, PARTIAL, PAID_IN_FULL
    }

    public BigDecimal getRemainingBalance() {
        return totalDebt.subtract(amountPaid);
    }
}
