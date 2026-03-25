package com.agropecuariopos.backend.repositories;

import com.agropecuariopos.backend.models.CompanySettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompanySettingsRepository extends JpaRepository<CompanySettings, Long> {
    
    // As there should be only one record, we can always fetch the first one.
    default Optional<CompanySettings> findFirst() {
        return findAll().stream().findFirst();
    }
}
