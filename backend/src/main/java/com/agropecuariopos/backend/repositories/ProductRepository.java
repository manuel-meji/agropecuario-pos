package com.agropecuariopos.backend.repositories;

import com.agropecuariopos.backend.models.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findByCabysCode(String cabysCode);

    Optional<Product> findByInternalCode(String internalCode);
}
