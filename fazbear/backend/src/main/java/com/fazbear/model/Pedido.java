package com.fazbear.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;

@Entity
@Table(name = "pedidos")
public class Pedido {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name = "id_pedido") public Long id;
    @ManyToOne(optional = false) @JoinColumn(name = "id_usuario") public Usuario usuario;
    @ManyToOne(optional = false) @JoinColumn(name = "id_pizzaria") public Pizzaria pizzaria;
    @Column(name = "data_pedido") public LocalDateTime dataPedido = LocalDateTime.now();
    @Column(name = "valor_total") public BigDecimal valorTotal;
    public String status = "Em preparo";
}
