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

    // Referencia a la venta que originó este comprobante (ManyToOne para permitir facturas y notas de crédito)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sale_id")
    private Sale sale;

    // Campos para <InformacionReferencia> (Notas de Crédito / Débito)
    @Column(length = 2)
    private String referenciaTipoDocumento; // ej: 01 para Factura
    
    @Column(length = 50)
    private String referenciaClave;         // Clave 50 dígitos del documento a anular/modificar
    
    private LocalDateTime referenciaFechaEmision;
    
    @Column(length = 2)
    private String referenciaCodigo;        // ej: 01 (Anula documento de referencia), 02 (Corrige monto), 03 (Corrige texto), 04 (Referencia otro exp), 05 (Sustituye prov)
    
    @Column(length = 180)
    private String referenciaRazon;

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
