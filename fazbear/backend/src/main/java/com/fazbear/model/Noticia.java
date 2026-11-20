package com.fazbear.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;

@Entity
@Table(name = "noticias")
public class Noticia {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name = "id_noticia") public Long id;
    public String titulo;
    @Column(columnDefinition = "TEXT") public String texto;
    public LocalDate data;
}
