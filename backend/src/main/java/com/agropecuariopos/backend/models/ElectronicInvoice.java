package com.agropecuariopos.backend.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Registro persistente de cada comprobante enviado al Ministerio de Hacienda CR.
 * Guarda el XML firmado, la clave única de 50 dígitos, y el estado de aceptación.
 */
@Entity
@Table(name = "electronic_invoices")
@Getter
@Setter
public class ElectronicInvoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Referencia a la venta que originó este comprobante
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sale_id", unique = true)
    private Sale sale;

    // Clave de 50 dígitos única ante Hacienda
    @Column(unique = true, nullable = false, length = 50)
    private String clave;

    // Número consecutivo en formato Hacienda (00100001011234567890)
    @Column(length = 20)
    private String numeroConsecutivo;

    // FACTURA_ELECTRONICA | TIQUETE_ELECTRONICO | NOTA_CREDITO | NOTA_DEBITO
    @Enumerated(EnumType.STRING)
    private TipoComprobante tipoComprobante;

    // PENDIENTE | ENVIADO | ACEPTADO | RECHAZADO | ERROR_ENVIO
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoComprobante estado = EstadoComprobante.PENDIENTE;

    // XML generado (sin firmar, para referencia)
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String xmlGenerado;

    // XML firmado (XAdES) en Base64 — el que se envía a Hacienda
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String xmlFirmadoBase64;

    // XML de respuesta de Hacienda (aceptación o rechazo)
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String xmlRespuestaHacienda;

    // Mensaje legible del resultado (de Hacienda) — puede ser largo en caso de error
    @Column(columnDefinition = "TEXT")
    private String mensajeRespuesta;

    // Timestamps
    private LocalDateTime fechaEnvio;
    private LocalDateTime fechaRespuesta;
    private LocalDateTime createdAt;

    // Número de reintentos de envío
    private Integer intentosEnvio = 0;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public enum TipoComprobante {
        FACTURA_ELECTRONICA,
        TIQUETE_ELECTRONICO,
        NOTA_CREDITO,
        NOTA_DEBITO
    }

    public enum EstadoComprobante {
        PENDIENTE,
        ENVIADO,
        ACEPTADO,
        RECHAZADO,
        ERROR_ENVIO
    }
}
