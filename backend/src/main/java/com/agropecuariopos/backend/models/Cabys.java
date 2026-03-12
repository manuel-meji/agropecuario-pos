package com.agropecuariopos.backend.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "cabys")
@Getter
@Setter
public class Cabys {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "cabys_code", length = 13, unique = true, nullable = false)
    private String cabysCode;

    @Column(length = 1000, nullable = false)
    private String description;

    @Column(name = "tax_rate", precision = 5, scale = 4, nullable = false)
    private BigDecimal taxRate;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
