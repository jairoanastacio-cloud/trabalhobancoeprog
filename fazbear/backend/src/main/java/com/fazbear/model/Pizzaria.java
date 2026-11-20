package com.fazbear.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;

@Entity
@Table(name = "pizzarias")
public class Pizzaria {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name = "id_pizzaria") public Long id;
    public String nome, endereco, cidade, telefone;
    public double latitude, longitude;
    /** Sabores separados por vírgula. */
    public String sabores;
}
