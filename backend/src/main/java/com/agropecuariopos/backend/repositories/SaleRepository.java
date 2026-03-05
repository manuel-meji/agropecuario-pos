package com.agropecuariopos.backend.repositories;

import com.agropecuariopos.backend.models.Client;
import com.agropecuariopos.backend.models.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
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
}
