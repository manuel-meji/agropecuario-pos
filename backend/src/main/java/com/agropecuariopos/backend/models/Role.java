package com.agropecuariopos.backend.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "roles")
@Getter
@Setter
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, unique = true)
    private RoleEnum name;

    public enum RoleEnum {
        ROLE_USER,
        ROLE_MODERATOR,
        ROLE_ADMIN
    }
}
