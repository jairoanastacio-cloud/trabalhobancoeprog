package com.fazbear.web;

import com.fazbear.model.Usuario;
import com.fazbear.repo.UsuarioRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    public record Cadastro(@NotBlank String nome, @Email @NotBlank String email, @Size(min = 6) String senha) {}
    public record Login(String email, String senha) {}
    public record Resposta(String token, Long id, String nome, String email) {}

    private final UsuarioRepository usuarios;
    private final TokenService tokens;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AuthController(UsuarioRepository usuarios, TokenService tokens) {
        this.usuarios = usuarios;
        this.tokens = tokens;
    }

    @PostMapping("/cadastro")
    public Resposta cadastro(@Valid @RequestBody Cadastro c) {
        String email = c.email().trim().toLowerCase();
        if (usuarios.existsByEmail(email)) throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail já cadastrado.");
        Usuario u = new Usuario();
        u.nome = c.nome().trim();
        u.email = email;
        u.senhaHash = encoder.encode(c.senha());
        return resposta(usuarios.save(u));
    }

    @PostMapping("/login")
    public Resposta login(@RequestBody Login l) {
        Usuario u = usuarios.findByEmail(l.email() == null ? "" : l.email().trim().toLowerCase())
                .filter(x -> l.senha() != null && encoder.matches(l.senha(), x.senhaHash))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "E-mail ou senha incorretos."));
        return resposta(u);
    }

    private Resposta resposta(Usuario u) {
        return new Resposta(tokens.criar(u.id), u.id, u.nome, u.email);
    }
}
