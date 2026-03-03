package com.agropecuariopos.backend.repositories;

import com.agropecuariopos.backend.models.Role;
import com.agropecuariopos.backend.models.Role.RoleEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(RoleEnum name);
}
