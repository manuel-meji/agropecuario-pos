package com.agropecuariopos.backend.services.contingency;

import com.agropecuariopos.backend.models.Sale;
import com.agropecuariopos.backend.repositories.SaleRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ContingencySyncDaemon {

    private static final Logger logger = LoggerFactory.getLogger(ContingencySyncDaemon.class);
    private static final String HACIENDA_API_SERVICE = "haciendaApiService";

    @Autowired
    private SaleRepository saleRepository;

    // Aquí iría el cliente Rest final a Hacienda para mandar XML base64. Simulamos
    // inyección
    // @Autowired private HaciendaSubmitClient submitClient;

    /**
     * Este demonio será disparado por @Scheduled(fixedDelay = 60000) o de manera
     * síncrona
     * mediante botones de la interfaz administrativa "Reenviar Rechazadas".
     * CircuitBreaker protege la Red cortando este método instantáneamente tras N
     * fallos.
     */
    @CircuitBreaker(name = HACIENDA_API_SERVICE, fallbackMethod = "contingencyStateFallback")
    public void synchronizePendingContingencyInvoices() {
        List<Sale> pendingSales = saleRepository.findByStatus(Sale.SaleStatus.CONTINGENCY_PENDING);

        if (pendingSales.isEmpty()) {
            return;
        }

        logger.info("Intentando Reconexión al API de Hacienda. Extrayendo {} facturas en Contingencia Local",
                pendingSales.size());

        for (Sale saleToSync : pendingSales) {
            // -- LÓGICA DE ENVÍO TRIBUTARIO --
            // boolean apiSuccess = submitClient.sendSignedInvoice(saleToSync.getId());
            boolean apiSuccess = simulateNetworkCall();

            if (apiSuccess) {
                logger.info("Sincronización CR EXITOSA para Factura: {}", saleToSync.getInvoiceNumber());
                saleToSync.setStatus(Sale.SaleStatus.COMPLETED);
                saleRepository.save(saleToSync);
            } else {
                throw new RuntimeException("Recepción OIDC 401/500/Timeout del API."); // Disparador para Circuit
                                                                                       // Breaker State: OPEN
            }
        }
    }

    /**
     * Fallback invocado automáticamente por io.github.resilience4j
     * SI EL CIRCUITO SE CORTA (Se abre) protegiendo el procesador por exceso de
     * fallas al exterior.
     */
    public void contingencyStateFallback(Exception ex) {
        logger.error(
                ">>> CIRCUIT BREAKER ACTIVADO <<< Suspendiendo reenvios transaccionales temporales debido a caida de red del Ministerio: {}",
                ex.getMessage());
        // Aquí puede enlazarse el Sistema de Eventos de la Fase 7 (Bot Telegram "El
        // Servidor Nacional está caído")
    }

    private boolean simulateNetworkCall() {
        // En producción esta bandera la deciden los 202 ACCEPTED de API MH-CR
        return true;
    }
}
