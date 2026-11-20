package com.fazbear.repo;

import com.fazbear.model.*;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    List<Pedido> findByUsuarioIdOrderByIdDesc(Long usuarioId);
}
