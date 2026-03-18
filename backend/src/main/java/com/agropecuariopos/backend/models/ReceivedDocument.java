package com.agropecuariopos.backend.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Documento electrónico recibido de un proveedor.
 * El emisor-receptor electrónico debe confirmar o rechazar en máx 8 días hábiles
 * del mes siguiente (Art. 10, Resolución MH-DGT-RES-0027-2024).
 */
@Entity
@Table(name = "received_documents")
@Getter
@Setter
public class ReceivedDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Clave de 50 dígitos del comprobante recibido (única por documento)
    @Column(unique = true, nullable = false, length = 50)
    private String clave;

    // Número consecutivo del comprobante del emisor
    @Column(length = 20)
    private String numeroConsecutivo;

    // Tipo de comprobante: 01=Factura, 04=Tiquete, 08=Factura Electrónica de Compra, etc.
    @Column(length = 2)
    private String tipoComprobante;

    // Datos del emisor (proveedor)
    @Column
    private String cedulaEmisor;

    private String nombreEmisor;

    private String emailEmisor;

    // Fecha en que el proveedor emitió el documento
    private LocalDateTime fechaEmisionDoc;

    // Monto total del comprobante (en la moneda original)
    @Column(precision = 14, scale = 5)
    private BigDecimal montoTotal;

    // Código de moneda (CRC, USD, etc.)
    @Column(length = 3)
    private String codigoMoneda = "CRC";

    // Estado de confirmación por el receptor (nosotros)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoConfirmacion estadoConfirmacion = EstadoConfirmacion.PENDIENTE;

    // Código de respuesta enviado a Hacienda: 1=Aceptado, 2=Parcial, 3=Rechazado
    @Column
    private Integer mensajeRespuesta; // null = aún no respondido

    // Detalle del mensaje (≥5 chars si es rechazo)
    @Column(columnDefinition = "TEXT")
    private String detalleMensaje;

    // Monto aceptado (solo para AceptarParcial = Mensaje 2)
    @Column(precision = 14, scale = 5)
    private BigDecimal montoAceptado;

    // XML original recibido del proveedor (almacenado en BD)
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String xmlRecibido;

    // XML del MensajeReceptor firmado que enviamos a Hacienda
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String xmlMensajeReceptorFirmado;

    // Respuesta de Hacienda al MensajeReceptor enviado
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String xmlRespuestaHacienda;

    // Generación y descarga
    private LocalDateTime fechaDescarga;
    private LocalDateTime fechaEnvioMensaje;
    private LocalDateTime fechaRespuestaHacienda;
    private LocalDateTime createdAt;

    // Registro de auditoría (Art. 10 §3): usuario que confirmó y fuente de importación
    @Column(length = 120)
    private String confirmadoPor;            // username/email del usuario que hizo la confirmación

    /** "API" = importada por clave desde Hacienda, "XML" = subida manualmente, "SYNC" = sincronización automática */
    @Column(length = 10)
    private String fuenteImportacion = "SYNC";

    // Número de secuencia de la clave Hacienda (posición 24-43 de la clave de 50 dígitos)
    @Column(length = 20)
    private String numeroSecuenciaClave;

    // Estado del envío del MensajeReceptor a Hacienda
    @Enumerated(EnumType.STRING)
    private EstadoEnvio estadoEnvioMensaje;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public enum EstadoConfirmacion {
        PENDIENTE,       // No se ha confirmado ni rechazado todavía
        ACEPTADO_TOTAL,  // Mensaje = 1
        ACEPTADO_PARCIAL,// Mensaje = 2
        RECHAZADO        // Mensaje = 3
    }

    public enum EstadoEnvio {
        PENDIENTE,
        ENVIADO,
        ACEPTADO_HACIENDA,
        RECHAZADO_HACIENDA,
        ERROR
    }
}
