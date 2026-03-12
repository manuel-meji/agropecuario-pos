package com.agropecuariopos.backend.repositories;

import com.agropecuariopos.backend.models.Client;
import com.agropecuariopos.backend.models.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {

    Optional<Sale> findByInvoiceNumber(String invoiceNumber);

    List<Sale> findByCreatedDateBetween(LocalDateTime start, LocalDateTime end);

    List<Sale> findByStatus(Sale.SaleStatus status);

    List<Sale> findByClientOrderByCreatedDateDesc(Client client);

    /**
     * Carga la venta con todos sus items y productos en un solo query (JOIN FETCH).
     * Necesario para el thread asíncrono de Hacienda donde no hay sesión Hibernate abierta.
     */
    @Query("SELECT s FROM Sale s LEFT JOIN FETCH s.items i LEFT JOIN FETCH i.product LEFT JOIN FETCH s.client WHERE s.id = :id")
    Optional<Sale> findByIdWithItems(@Param("id") Long id);
}
