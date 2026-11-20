package com.fazbear.web;

import com.fazbear.model.Pontuacao;
import com.fazbear.repo.*;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/pontuacoes")
public class PontuacaoController {
    public record NovaPontuacao(String jogo, int pontos) {}
    public record RankingDto(String jogador, String jogo, int pontos) {}

    private final PontuacaoRepository pontuacoes;
    private final UsuarioRepository usuarios;
    private final TokenService tokens;

    public PontuacaoController(PontuacaoRepository p, UsuarioRepository u, TokenService t) {
        this.pontuacoes = p; this.usuarios = u; this.tokens = t;
    }

    @PostMapping
    public void salvar(@RequestHeader(value = "Authorization", defaultValue = "") String auth, @RequestBody NovaPontuacao n) {
        long uid = tokens.exigir(auth);
        if (n.pontos() <= 0 || !List.of("A", "B", "C").contains(n.jogo()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pontuação inválida.");
        Pontuacao p = new Pontuacao();
        p.usuario = usuarios.getReferenceById(uid);
        p.jogo = n.jogo();
        p.pontos = n.pontos();
        pontuacoes.save(p);
    }

    @GetMapping("/ranking")
    public List<RankingDto> ranking() {
        return pontuacoes.findTop10ByOrderByPontosDesc().stream()
                .map(p -> new RankingDto(p.usuario.nome, p.jogo, p.pontos)).toList();
    }
}
