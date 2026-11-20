package com.fazbear.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;

@Entity
@Table(name = "mascotes")
public class Mascote {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name = "id_mascote") public Long id;
    public String nome, descricao, imagem;
    @Column(columnDefinition = "TEXT") public String historia;
}
