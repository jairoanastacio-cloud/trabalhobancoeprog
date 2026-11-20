package com.fazbear;

import com.fazbear.model.*;
import com.fazbear.repo.*;
import java.time.LocalDate;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/** Cria os dados iniciais na primeira execução (só se as tabelas estiverem vazias). Edite à vontade. */
@Component
public class DadosIniciais implements CommandLineRunner {
    private final PizzariaRepository pizzarias;
    private final MascoteRepository mascotes;
    private final NoticiaRepository noticias;

    public DadosIniciais(PizzariaRepository p, MascoteRepository m, NoticiaRepository n) {
        this.pizzarias = p; this.mascotes = m; this.noticias = n;
    }

    @Override
    public void run(String... args) {
        if (pizzarias.count() == 0) {
            pizzarias.save(pizzaria("Fazbear’s Pizza - Centro", "Rua das Luzes, 100", 0.020, 0.015, "(00) 0000-0001", "Calabresa,Mussarela,Pepperoni"));
            pizzarias.save(pizzaria("Freddy Fazbear’s Pizza - Norte", "Av. do Palco, 250", 0.028, 0.043, "(00) 0000-0002", "Mussarela,Frango com catupiry,Portuguesa"));
            pizzarias.save(pizzaria("Fazbear’s Pizza - Parque", "Praça do Pirata, 7", 0.008, 0.030, "(00) 0000-0003", "Pepperoni,Margherita,Quatro queijos"));
            pizzarias.save(pizzaria("Fazbear’s Pizza - Sul", "Rua do Bolo, 33", 0.004, 0.050, "(00) 0000-0004", "Calabresa,Chocolate,Mussarela"));
        }
        if (mascotes.count() == 0) {
            mascotes.save(mascote("Freddy Fazbear", "Urso marrom, vocalista e líder da banda.", "Estrela do palco principal, recebe as crianças com um microfone na mão.", "img/freddy.png"));
            mascotes.save(mascote("Bonnie", "Coelho roxo, guitarrista da banda.", "Sempre de guitarra, anima as festas com solos.", "img/bonnie.png"));
            mascotes.save(mascote("Chica", "Galinha amarela, cantora e fã de cupcakes.", "Carrega o babador “Let’s Eat!” e cuida da cozinha.", "img/chica.png"));
            mascotes.save(mascote("Foxy", "Raposa pirata do Pirate Cove.", "Faz shows de pirata com tapa-olho e gancho para as crianças.", "img/foxy.png"));
        }
        if (noticias.count() == 0) {
            noticias.save(noticia("Novidade no palco!", "Freddy Fazbear e sua banda agora fazem shows todos os dias.", LocalDate.of(1993, 3, 1)));
            noticias.save(noticia("Pirate Cove reaberto", "A área do Foxy, o pirata, voltou a receber visitantes.", LocalDate.of(1993, 5, 12)));
            noticias.save(noticia("Festa de aniversário completa", "Reserve a mesa e o bolo com a gente.", LocalDate.of(1993, 7, 20)));
        }
    }

    private static Pizzaria pizzaria(String nome, String endereco, double lat, double lng, String tel, String sabores) {
        Pizzaria p = new Pizzaria();
        p.nome = nome; p.endereco = endereco; p.cidade = "Fazbear City";
        p.latitude = lat; p.longitude = lng; p.telefone = tel; p.sabores = sabores;
        return p;
    }

    private static Mascote mascote(String nome, String descricao, String historia, String imagem) {
        Mascote m = new Mascote();
        m.nome = nome; m.descricao = descricao; m.historia = historia; m.imagem = imagem;
        return m;
    }

    private static Noticia noticia(String titulo, String texto, LocalDate data) {
        Noticia n = new Noticia();
        n.titulo = titulo; n.texto = texto; n.data = data;
        return n;
    }
}
