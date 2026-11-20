// Servidor simulado no navegador (localStorage), com o mesmo contrato da API Java.
// Serve para abrir o site sem back-end. No projeto completo, js/api.js fala com o Spring Boot.
(function () {
  const IMG = window.FAZBEAR_IMG;
  const CONTEUDO = {
    noticias: [
      { id: 3, titulo: "Festa de aniversário completa", texto: "Reserve a mesa e o bolo com a gente.", data: "1993-07-20" },
      { id: 2, titulo: "Pirate Cove reaberto", texto: "A área do Foxy, o pirata, voltou a receber visitantes.", data: "1993-05-12" },
      { id: 1, titulo: "Novidade no palco!", texto: "Freddy Fazbear e sua banda agora fazem shows todos os dias.", data: "1993-03-01" },
    ],
    mascotes: [
      { id: 1, nome: "Freddy Fazbear", descricao: "Urso marrom, vocalista e líder da banda.", historia: "Estrela do palco principal, recebe as crianças com um microfone na mão.", imagem: IMG.freddy },
      { id: 2, nome: "Bonnie", descricao: "Coelho roxo, guitarrista da banda.", historia: "Sempre de guitarra, anima as festas com solos.", imagem: IMG.bonnie },
      { id: 3, nome: "Chica", descricao: "Galinha amarela, cantora e fã de cupcakes.", historia: "Carrega o babador “Let’s Eat!” e cuida da cozinha.", imagem: IMG.chica },
      { id: 4, nome: "Foxy", descricao: "Raposa pirata do Pirate Cove.", historia: "Faz shows de pirata com tapa-olho e gancho para as crianças.", imagem: IMG.foxy },
    ],
    pizzarias: [
      { id: 1, nome: "Fazbear’s Pizza - Centro", endereco: "Rua das Luzes, 100", cidade: "Fazbear City", telefone: "(00) 0000-0001", latitude: 0.020, longitude: 0.015, sabores: ["Calabresa", "Mussarela", "Pepperoni"] },
      { id: 2, nome: "Freddy Fazbear’s Pizza - Norte", endereco: "Av. do Palco, 250", cidade: "Fazbear City", telefone: "(00) 0000-0002", latitude: 0.028, longitude: 0.043, sabores: ["Mussarela", "Frango com catupiry", "Portuguesa"] },
      { id: 3, nome: "Fazbear’s Pizza - Parque", endereco: "Praça do Pirata, 7", cidade: "Fazbear City", telefone: "(00) 0000-0003", latitude: 0.008, longitude: 0.030, sabores: ["Pepperoni", "Margherita", "Quatro queijos"] },
      { id: 4, nome: "Fazbear’s Pizza - Sul", endereco: "Rua do Bolo, 33", cidade: "Fazbear City", telefone: "(00) 0000-0004", latitude: 0.004, longitude: 0.050, sabores: ["Calabresa", "Chocolate", "Mussarela"] },
    ],
    cardapio: [
      { nome: "Pizza Fazbear (média)", preco: 39.9 }, { nome: "Pizza Pepperoni (grande)", preco: 54.9 },
      { nome: "Refrigerante", preco: 7 }, { nome: "Fatia do bolo da Chica", preco: 12.5 },
    ],
  };

  const bd = {
    ler(k, padrao) { try { return JSON.parse(localStorage.getItem("fzdb_" + k)) ?? padrao; } catch (e) { return padrao; } },
    gravar(k, v) { try { localStorage.setItem("fzdb_" + k, JSON.stringify(v)); } catch (e) { /* armazenamento indisponível */ } },
  };
  async function hash(s) {
    if (!(window.crypto && crypto.subtle)) return btoa(unescape(encodeURIComponent(s)));
    const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
    return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
  }
  function km(la1, lo1, la2, lo2) {
    const r = Math.PI / 180, a = Math.sin(((la2 - la1) * r) / 2) ** 2 + Math.cos(la1 * r) * Math.cos(la2 * r) * Math.sin(((lo2 - lo1) * r) / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
  const erro = (m) => { throw new Error(m); };
  const sessao = (usuarios) => {
    const t = localStorage.getItem("fz_token") || "", id = t.startsWith("t") ? +t.slice(1) : 0;
    return usuarios.find((u) => u.id === id) || erro("Faça login para continuar.");
  };
  const resposta = (u) => ({ token: "t" + u.id, id: u.id, nome: u.nome, email: u.email });

  window.apiLocal = async function (caminho, opcoes = {}) {
    const [rota, consulta] = caminho.split("?"), q = new URLSearchParams(consulta || ""), b = opcoes.body || {};
    const usuarios = bd.ler("usuarios", []);
    switch ((opcoes.method || "GET") + " " + rota) {
      case "GET /noticias": return CONTEUDO.noticias;
      case "GET /mascotes": return CONTEUDO.mascotes;
      case "GET /cardapio": return CONTEUDO.cardapio;
      case "GET /pizzarias": {
        const lat = parseFloat(q.get("lat")), lng = parseFloat(q.get("lng"));
        const lista = CONTEUDO.pizzarias.map((p) => ({ ...p, distanciaKm: isNaN(lat) ? null : km(lat, lng, p.latitude, p.longitude) }));
        return isNaN(lat) ? lista : lista.sort((x, y) => x.distanciaKm - y.distanciaKm);
      }
      case "POST /auth/cadastro": {
        const email = String(b.email || "").trim().toLowerCase();
        if (!String(b.nome || "").trim() || !email.includes("@")) erro("Preencha nome e e-mail válidos.");
        if (String(b.senha || "").length < 6) erro("A senha precisa ter pelo menos 6 caracteres.");
        if (usuarios.some((u) => u.email === email)) erro("E-mail já cadastrado.");
        const u = { id: usuarios.length + 1, nome: b.nome.trim(), email, senha_hash: await hash(b.senha) };
        usuarios.push(u); bd.gravar("usuarios", usuarios);
        return resposta(u);
      }
      case "POST /auth/login": {
        const h = await hash(String(b.senha || ""));
        const u = usuarios.find((x) => x.email === String(b.email || "").trim().toLowerCase() && x.senha_hash === h);
        return u ? resposta(u) : erro("E-mail ou senha incorretos.");
      }
      case "POST /pedidos": {
        const u = sessao(usuarios), pz = CONTEUDO.pizzarias.find((p) => p.id === b.pizzariaId);
        if (!pz) erro("Pizzaria inválida.");
        let total = 0;
        for (const i of b.itens || []) {
          const item = CONTEUDO.cardapio[i.indice];
          if (!item || !(i.qtd > 0)) erro("Item inválido.");
          total += item.preco * i.qtd;
        }
        if (!total) erro("Pedido vazio.");
        const pedidos = bd.ler("pedidos", []);
        const p = { id: pedidos.length + 1, uid: u.id, pizzaria: pz.nome, data: new Date().toISOString(), valorTotal: Math.round(total * 100) / 100, status: "Em preparo" };
        pedidos.push(p); bd.gravar("pedidos", pedidos);
        return p;
      }
      case "GET /pedidos/meus": {
        const u = sessao(usuarios);
        return bd.ler("pedidos", []).filter((p) => p.uid === u.id).reverse();
      }
      case "POST /pontuacoes": {
        const u = sessao(usuarios);
        if (!(b.pontos > 0) || !["A", "B", "C"].includes(b.jogo)) erro("Pontuação inválida.");
        const r = bd.ler("pontuacoes", []); r.push({ uid: u.id, jogo: b.jogo, pontos: b.pontos }); bd.gravar("pontuacoes", r);
        return null;
      }
      case "GET /pontuacoes/ranking":
        return bd.ler("pontuacoes", []).sort((x, y) => y.pontos - x.pontos).slice(0, 10)
          .map((p) => ({ jogador: (usuarios.find((u) => u.id === p.uid) || {}).nome || "?", jogo: p.jogo, pontos: p.pontos }));
      default: return erro("Rota não encontrada: " + rota);
    }
  };
})();
