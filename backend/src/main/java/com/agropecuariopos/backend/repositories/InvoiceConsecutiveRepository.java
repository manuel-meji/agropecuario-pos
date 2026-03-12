package com.agropecuariopos.backend.repositories;

import com.agropecuariopos.backend.models.InvoiceConsecutive;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InvoiceConsecutiveRepository extends JpaRepository<InvoiceConsecutive, Long> {
    Optional<InvoiceConsecutive> findByTipoDocumento(String tipoDocumento);
}
