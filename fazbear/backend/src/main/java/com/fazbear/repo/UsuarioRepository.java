package com.fazbear.repo;

import com.fazbear.model.*;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    boolean existsByEmail(String email);
    java.util.Optional<Usuario> findByEmail(String email);
}
