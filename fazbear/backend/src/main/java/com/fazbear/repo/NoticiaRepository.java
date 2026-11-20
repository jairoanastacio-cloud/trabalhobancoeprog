package com.fazbear.repo;

import com.fazbear.model.*;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NoticiaRepository extends JpaRepository<Noticia, Long> {
    List<Noticia> findAllByOrderByDataDesc();
}
