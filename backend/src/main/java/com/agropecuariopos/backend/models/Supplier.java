package com.agropecuariopos.backend.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.envers.Audited;

@Entity
@Table(name = "suppliers")
@Getter
@Setter
@Audited
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String name;

    private String identification;

    private String email;

    private String phone;

    private String address;

    private String contactPerson;
}
