package com.fazbear.web;

import com.fazbear.model.*;
import com.fazbear.repo.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api")
public class PedidoController {
    public record ItemCardapio(String nome, BigDecimal preco) {}
    public record ItemPedido(int indice, int qtd) {}
    public record NovoPedido(Long pizzariaId, List<ItemPedido> itens) {}
    public record PedidoDto(Long id, String pizzaria, LocalDateTime data, BigDecimal valorTotal, String status) {}

    /** Cardápio. Edite aqui. */
    static final List<ItemCardapio> CARDAPIO = List.of(
            new ItemCardapio("Pizza Fazbear (média)", new BigDecimal("39.90")),
            new ItemCardapio("Pizza Pepperoni (grande)", new BigDecimal("54.90")),
            new ItemCardapio("Refrigerante", new BigDecimal("7.00")),
            new ItemCardapio("Fatia do bolo da Chica", new BigDecimal("12.50")));

    private final PedidoRepository pedidos;
    private final PizzariaRepository pizzarias;
    private final UsuarioRepository usuarios;
    private final TokenService tokens;

    public PedidoController(PedidoRepository p, PizzariaRepository pz, UsuarioRepository u, TokenService t) {
        this.pedidos = p; this.pizzarias = pz; this.usuarios = u; this.tokens = t;
    }

    @GetMapping("/cardapio")
    public List<ItemCardapio> cardapio() { return CARDAPIO; }

    @PostMapping("/pedidos")
    public PedidoDto criar(@RequestHeader(value = "Authorization", defaultValue = "") String auth, @RequestBody NovoPedido novo) {
        long uid = tokens.exigir(auth);
        Pizzaria pizzaria = pizzarias.findById(novo.pizzariaId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pizzaria inválida."));
        BigDecimal total = BigDecimal.ZERO;
        for (ItemPedido i : novo.itens()) {
            if (i.indice() < 0 || i.indice() >= CARDAPIO.size() || i.qtd() <= 0)
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Item inválido.");
            total = total.add(CARDAPIO.get(i.indice()).preco().multiply(BigDecimal.valueOf(i.qtd())));
        }
        if (total.signum() == 0) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pedido vazio.");
        Pedido p = new Pedido();
        p.usuario = usuarios.getReferenceById(uid);
        p.pizzaria = pizzaria;
        p.valorTotal = total; // o total é calculado no servidor, nunca vem do navegador
        return dto(pedidos.save(p));
    }

    @GetMapping("/pedidos/meus")
    public List<PedidoDto> meus(@RequestHeader(value = "Authorization", defaultValue = "") String auth) {
        return pedidos.findByUsuarioIdOrderByIdDesc(tokens.exigir(auth)).stream().map(this::dto).toList();
    }

    private PedidoDto dto(Pedido p) {
        return new PedidoDto(p.id, p.pizzaria.nome, p.dataPedido, p.valorTotal, p.status);
    }
}
