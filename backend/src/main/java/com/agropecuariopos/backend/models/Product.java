package com.agropecuariopos.backend.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.envers.Audited;
import org.hibernate.envers.RelationTargetAuditMode;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;

@Entity
@Table(name = "products")
@Getter
@Setter
@Audited
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 200)
    private String name;

    private String internalCode;

    // Código del banco central de 13 dígitos
    @Size(max = 13)
    private String cabysCode;

    @DecimalMin("0.0")
    @Column(precision = 12, scale = 2)
    private BigDecimal purchaseCost;

    @DecimalMin("0.0")
    @Column(precision = 12, scale = 2)
    private BigDecimal salePrice;

    @Min(0)
    private Integer stockQuantity;

    // Define exención impositiva (e.g. 1% agroquímicos si el cliente está en EXONET)
    private Boolean isAgrochemicalInsufficiency;

    // Tasa de impuesto aplicable (%). 0 = exento, 1 = agroquímico, 13 = IVA estándar
    @DecimalMin("0.0")
    @Column(precision = 5, scale = 2, columnDefinition = "DECIMAL(5,2) DEFAULT 13.00")
    private BigDecimal taxRate = BigDecimal.valueOf(13);

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_categoria")
    @Audited(targetAuditMode = RelationTargetAuditMode.NOT_AUDITED)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private Category category;

    // Bloqueo Optimista: previene condiciones de carrera si 2 empleados venden el
    // mismo producto en el mismo ms
    @Version
    private Long version;
}
