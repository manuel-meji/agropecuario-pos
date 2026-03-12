package com.agropecuariopos.backend.services.hacienda;

import com.agropecuariopos.backend.models.InvoiceConsecutive;
import com.agropecuariopos.backend.repositories.InvoiceConsecutiveRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * Genera la clave única de 50 dígitos requerida por Hacienda CR
 * y administra los consecutivos de documentos.
 *
 * Formato: [3 País][6 Fecha ddMMyy][12 Cédula][20 Consecutivo][1 Situación][8 Seguridad]
 * Total:   3 + 6 + 12 + 20 + 1 + 8 = 50 dígitos
 */
@Service
public class ClaveHaciendaService {

    private static final String PAIS = "506";
    private static final SecureRandom RANDOM = new SecureRandom();

    @Value("${hacienda.emisor.cedula}")
    private String emisorCedula;

    @Autowired
    private InvoiceConsecutiveRepository consecutiveRepository;

    /**
     * Genera la clave de 50 dígitos usando un consecutivo ya generado.
     *
     * @param tipoDocumento código del tipo ("01", "04", etc.)
     * @param consecutivo   el consecutivo de 20 dígitos ya generado previamente
     * @param situacion     1=Normal, 2=Contingencia, 3=Sin Internet
     */
    public String generarClaveConConsecutivo(String tipoDocumento, String consecutivo, int situacion) {
        // Fecha: ddMMyy (6 dígitos, año con 2 dígitos) — formato oficial Hacienda
        String fecha = LocalDate.now().format(DateTimeFormatter.ofPattern("ddMMyy"));
        String cedulaPadded = String.format("%012d", Long.parseLong(emisorCedula.replaceAll("[^0-9]", "")));
        // Código de seguridad: 8 dígitos (posiciones 43-50 de la clave)
        String codigoSeguridad = String.format("%08d", Math.abs(RANDOM.nextInt(99999999)));

        String clave = PAIS + fecha + cedulaPadded + consecutivo + situacion + codigoSeguridad;

        if (clave.length() != 50) {
            throw new IllegalStateException("La clave generada tiene " + clave.length() + " dígitos (deben ser exactamente 50). Consecutivo: '" + consecutivo + "'");
        }
        return clave;
    }

    /**
     * Genera la clave de 50 dígitos para el comprobante.
     * Genera un nuevo consecutivo internamente.
     *
     * @param tipoDocumento "01" Factura, "04" Tiquete, "03" Nota Crédito, "02" Nota Débito
     * @param situacion     1=Normal, 2=Contingencia, 3=Sin Internet
     * @return clave de 50 dígitos
     */
    public String generarClave(String tipoDocumento, int situacion) {
        // Fecha: ddMMyy (6 dígitos, año con 2 dígitos) — formato oficial Hacienda
        String fecha = LocalDate.now().format(DateTimeFormatter.ofPattern("ddMMyy"));
        String cedulaPadded = String.format("%012d", Long.parseLong(emisorCedula.replaceAll("[^0-9]", "")));
        String consecutivo = generarConsecutivo(tipoDocumento);
        // Código de seguridad: 8 dígitos (posiciones 43-50 de la clave)
        String codigoSeguridad = String.format("%08d", Math.abs(RANDOM.nextInt(99999999)));

        String clave = PAIS + fecha + cedulaPadded + consecutivo + situacion + codigoSeguridad;

        if (clave.length() != 50) {
            throw new IllegalStateException("La clave generada tiene " + clave.length() + " dígitos (deben ser exactamente 50). Verificá la cédula del emisor.");
        }

        return clave;
    }

    /**
     * Genera el número consecutivo en formato de 20 dígitos de Hacienda.
     * Formato: [3 Sucursal][3 PuntoVenta][2 TipoDoc][10 Consecutivo]
     *
     * @param tipoDocumento Código de tipo ("01" a "13")
     * @return String de 20 caracteres
     */
    @Transactional
    public synchronized String generarConsecutivo(String tipoDocumento) {
        InvoiceConsecutive consecutive = consecutiveRepository
                .findByTipoDocumento(tipoDocumento)
                .orElseGet(() -> {
                    InvoiceConsecutive nuevo = new InvoiceConsecutive();
                    nuevo.setTipoDocumento(tipoDocumento);
                    nuevo.setSucursal("001");
                    nuevo.setPuntoVenta("00001"); // 5 dígitos según estándar Hacienda
                    nuevo.setUltimoConsecutivo(0L);
                    return nuevo;
                });

        long nuevoConsecutivo = consecutive.getUltimoConsecutivo() + 1;
        consecutive.setUltimoConsecutivo(nuevoConsecutivo);
        consecutiveRepository.save(consecutive);

        // Formato Hacienda: [3 Sucursal][5 PuntoVenta][2 TipoDoc][10 Consecutivo] = 20 chars
        return consecutive.getSucursal()                     // 3 chars (ej: "001")
                + consecutive.getPuntoVenta()                // 5 chars (ej: "00001")
                + tipoDocumento                              // 2 chars (ej: "01")
                + String.format("%010d", nuevoConsecutivo);  // 10 chars (ej: "0000000001")
    }
}
