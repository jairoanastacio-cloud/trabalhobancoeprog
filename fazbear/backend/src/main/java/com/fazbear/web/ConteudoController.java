package com.fazbear.web;

import com.fazbear.model.*;
import com.fazbear.repo.*;
import java.util.*;
import org.springframework.web.bind.annotation.*;

/** Notícias, mascotes e pizzarias (conteúdo que o funcionário responsável atualiza no banco). */
@RestController
@RequestMapping("/api")
public class ConteudoController {
    public record PizzariaDto(Long id, String nome, String endereco, String cidade, String telefone,
                              double latitude, double longitude, List<String> sabores, Double distanciaKm) {}

    private final NoticiaRepository noticias;
    private final MascoteRepository mascotes;
    private final PizzariaRepository pizzarias;

    public ConteudoController(NoticiaRepository n, MascoteRepository m, PizzariaRepository p) {
        this.noticias = n; this.mascotes = m; this.pizzarias = p;
    }

    @GetMapping("/noticias")
    public List<Noticia> noticias() { return noticias.findAllByOrderByDataDesc(); }

    @GetMapping("/mascotes")
    public List<Mascote> mascotes() { return mascotes.findAll(); }

    /** Com ?lat=&lng= devolve ordenado pela distância (Haversine). */
    @GetMapping("/pizzarias")
    public List<PizzariaDto> pizzarias(@RequestParam(required = false) Double lat, @RequestParam(required = false) Double lng) {
        List<PizzariaDto> lista = new ArrayList<>();
        for (Pizzaria p : pizzarias.findAll()) {
            Double d = (lat == null || lng == null) ? null : km(lat, lng, p.latitude, p.longitude);
            lista.add(new PizzariaDto(p.id, p.nome, p.endereco, p.cidade, p.telefone, p.latitude, p.longitude,
                    p.sabores == null ? List.of() : Arrays.asList(p.sabores.split(",")), d));
        }
        if (lat != null && lng != null) lista.sort(Comparator.comparing(PizzariaDto::distanciaKm));
        return lista;
    }

    private static double km(double la1, double lo1, double la2, double lo2) {
        double dLa = Math.toRadians(la2 - la1), dLo = Math.toRadians(lo2 - lo1);
        double a = Math.pow(Math.sin(dLa / 2), 2)
                + Math.cos(Math.toRadians(la1)) * Math.cos(Math.toRadians(la2)) * Math.pow(Math.sin(dLo / 2), 2);
        return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}
