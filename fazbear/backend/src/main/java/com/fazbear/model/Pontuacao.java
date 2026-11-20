package com.fazbear.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;

@Entity
@Table(name = "pontuacoes")
public class Pontuacao {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name = "id_pontuacao") public Long id;
    @ManyToOne(optional = false) @JoinColumn(name = "id_usuario") public Usuario usuario;
    public String jogo;
    public int pontos;
    public LocalDateTime data = LocalDateTime.now();
}
