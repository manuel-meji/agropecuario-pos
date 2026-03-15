package com.agropecuariopos.backend.repositories;

import com.agropecuariopos.backend.models.Cabys;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CabysRepository extends JpaRepository<Cabys, Integer> {
    Optional<Cabys> findByCabysCode(String cabysCode);
    java.util.List<Cabys> findTop50ByDescriptionContainingIgnoreCaseOrCabysCodeContainingIgnoreCase(String description, String cabysCode);
}
