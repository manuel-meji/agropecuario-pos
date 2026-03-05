package com.agropecuariopos.backend.repositories;

import com.agropecuariopos.backend.models.AccountReceivable;
import com.agropecuariopos.backend.models.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountReceivableRepository extends JpaRepository<AccountReceivable, Long> {

    Optional<AccountReceivable> findByRelatedSale(Sale sale);

    List<AccountReceivable> findByClientNameOrderByIdDesc(String clientName);
}
