package com.agropecuariopos.backend.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.envers.Audited;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "daily_expenses")
@Getter
@Setter
@Audited
@EntityListeners(AuditingEntityListener.class)
public class DailyExpense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String description;

    @NotNull
    @Enumerated(EnumType.STRING)
    private ExpenseCategory category;

    @NotNull
    @DecimalMin("0.01")
    @Column(precision = 12, scale = 2)
    private BigDecimal amount;

    // Deduction logic on Net Profit
    private Boolean isDeductibleFromProfit;

    @CreatedBy
    @Column(updatable = false)
    private String registeredBy;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime registeredDate;

    public enum ExpenseCategory {
        OPERATIONAL_UTILITIES, PAYROLL, LOGISTICS, MAINTENANCE, TAXES, MISCELLANEOUS, OTROS
    }
}
