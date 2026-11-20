package com.fazbear.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;

@Entity
@Table(name = "usuarios")
public class Usuario {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name = "id_usuario") public Long id;
    @Column(nullable = false) public String nome;
    @Column(nullable = false, unique = true) public String email;
    @Column(name = "senha_hash", nullable = false) public String senhaHash;
}
