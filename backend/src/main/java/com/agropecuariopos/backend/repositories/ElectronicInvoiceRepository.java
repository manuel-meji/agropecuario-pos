package com.agropecuariopos.backend.repositories;

import com.agropecuariopos.backend.models.ElectronicInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ElectronicInvoiceRepository extends JpaRepository<ElectronicInvoice, Long> {

    Optional<ElectronicInvoice> findByClave(String clave);

    Optional<ElectronicInvoice> findBySaleId(Long saleId);

    List<ElectronicInvoice> findByEstado(ElectronicInvoice.EstadoComprobante estado);

    @Query("SELECT e FROM ElectronicInvoice e WHERE e.estado = 'ENVIADO' AND e.intentosEnvio < 5")
    List<ElectronicInvoice> findPendingStatusCheck();

    @Query("SELECT e FROM ElectronicInvoice e LEFT JOIN FETCH e.sale s LEFT JOIN FETCH s.client WHERE e.id = :id")
    Optional<ElectronicInvoice> findByIdWithRelations(Long id);
}
