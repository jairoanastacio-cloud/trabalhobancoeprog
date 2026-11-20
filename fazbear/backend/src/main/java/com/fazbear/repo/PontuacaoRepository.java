package com.fazbear.repo;

import com.fazbear.model.*;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PontuacaoRepository extends JpaRepository<Pontuacao, Long> {
    List<Pontuacao> findTop10ByOrderByPontosDesc();
}
