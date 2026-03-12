package com.agropecuariopos.backend.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 * Controla el consecutivo de cada tipo de comprobante electrónico.
 * Hacienda exige secuencialidad estricta sin saltos.
 */
@Entity
@Table(name = "invoice_consecutives")
@Getter
@Setter
public class InvoiceConsecutive {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Código Hacienda: 01=Factura, 02=Nota Débito, 03=Nota Crédito, 04=Tiquete, etc.
    @Column(unique = true, nullable = false, length = 2)
    private String tipoDocumento;

    @Column(nullable = false)
    private Long ultimoConsecutivo = 0L;

    // Punto de venta: 5 dígitos según estándar Hacienda (ej: "00001")
    @Column(nullable = false, length = 5)
    private String puntoVenta = "00001";

    // Sucursal (siempre "001")
    @Column(nullable = false, length = 3)
    private String sucursal = "001";
}
