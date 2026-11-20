// Interface do site. Dados vêm da API Java (veja js/api.js).
const $ = (s) => document.querySelector(s);
const reais = (n) => "R$ " + Number(n).toFixed(2).replace(".", ",");
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const MAPA = window.FAZBEAR_MAPA;

const estado = {
  usuario: JSON.parse(localStorage.getItem("fz_user") || "null"),
  pos: { lat: MAPA.lat / 2, lng: MAPA.lng / 2 }, // posição "do usuário" no mapa
  pizzarias: [], cardapio: [], carrinho: {}, pizzariaId: null,
};

/* ---------- Navegação ---------- */
const abas = [["inicio", "Início"], ["noticias", "Notícias"], ["pizzarias", "Pizzarias"], ["comprar", "Comprar"], ["mascotes", "Mascotes"], ["jogos", "Jogos"], ["conta", "Conta"]];
$("#nav").innerHTML = abas.map((a) => `<button data-go="${a[0]}">${a[1]}</button>`).join("");

function ir(id) {
  document.querySelectorAll("section").forEach((s) => s.classList.toggle("on", s.id === id));
  document.querySelectorAll("#nav button").forEach((b) => b.classList.toggle("on", b.dataset.go === id));
  const aoAbrir = { comprar: renderCompra, conta: renderConta, jogos: () => { renderRanking(); iniciarJogo(salvarPontos); } };
  if (aoAbrir[id]) aoAbrir[id]();
  history.replaceState(null, "", "#" + id);
  window.scrollTo({ top: 0, behavior: "smooth" });
}
document.addEventListener("click", (e) => {
  const g = e.target.closest("[data-go]"); if (g) return ir(g.dataset.go);
  const p = e.target.closest("[data-pick]"); if (p) { estado.pizzariaId = +p.dataset.pick; ir("comprar"); return; }
  const q = e.target.closest("[data-q]");
  if (q) { const [i, d] = q.dataset.q.split(":"); estado.carrinho[i] = Math.max(0, (estado.carrinho[i] || 0) + +d); renderCompra(); }
});

/* ---------- Notícias e mascotes ---------- */
async function carregarConteudo() {
  try {
    const [noticias, mascotes] = await Promise.all([api("/noticias"), api("/mascotes")]);
    $("#news").innerHTML = noticias.map((n) => `<div class="card"><small>${n.data.split("-").reverse().join("/")}</small><h3>${esc(n.titulo)}</h3><p>${esc(n.texto)}</p></div>`).join("");
    $("#mas").innerHTML = mascotes.map((m) => `<article class="card mascote">
      ${m.imagem ? `<img class="foto" src="${esc(m.imagem)}" alt="${esc(m.nome)}">` : `<div class="ph">[ IMAGEM: ${esc(m.nome)} ]</div>`}
      <div><h3>${esc(m.nome)}</h3><p class="resumo">${esc(m.descricao)}</p><p>${esc(m.historia)}</p></div></article>`).join("");
  } catch (e) {
    $("#news").innerHTML = `<div class="msg er">Não foi possível falar com o servidor (${esc(e.message)}). A API Java está rodando?</div>`;
  }
}

/* ---------- Mapa e pizzarias ---------- */
async function carregarPizzarias() {
  estado.pizzarias = await api(`/pizzarias?lat=${estado.pos.lat}&lng=${estado.pos.lng}`);
  desenharMapa();
}
const paraXY = (lat, lng) => ({ x: (lng / MAPA.lng) * 600, y: (1 - lat / MAPA.lat) * 360 });

function desenharMapa() {
  let h = '<rect width="600" height="360" fill="#9ec57a"/><path d="M0 180H600M300 0V360M0 60 600 300" stroke="#e8dca8" stroke-width="14" fill="none"/><path d="M0 330C150 280 250 350 600 220" stroke="#6fb3e0" stroke-width="18" fill="none"/>';
  estado.pizzarias.forEach((p, i) => {
    const { x, y } = paraXY(p.latitude, p.longitude);
    h += `<g data-pin="${p.id}" style="cursor:pointer"><circle cx="${x}" cy="${y}" r="13" fill="#c0201e" stroke="#f5c518" stroke-width="3"/><text x="${x}" y="${y + 5}" text-anchor="middle" font-size="14" fill="#fff" font-weight="bold">${i + 1}</text>
      <text x="${x}" y="${y + 30}" text-anchor="middle" font-size="12" font-weight="bold" fill="#1a0f06" stroke="#fff" stroke-width="3" paint-order="stroke">${esc(p.nome.split(" - ").pop())}</text></g>`;
  });
  const u = paraXY(estado.pos.lat, estado.pos.lng);
  $("#map").innerHTML = h + `<circle cx="${u.x}" cy="${u.y}" r="9" fill="#4b2a7a" stroke="#fff" stroke-width="3"/><text x="${u.x}" y="${u.y + 26}" text-anchor="middle" font-size="12" font-weight="bold" fill="#1a0f06">Você</text>`;

  $("#plist").innerHTML = estado.pizzarias.map((p, i) => `<div class="card">
    <div class="row"><b>${i + 1}. ${esc(p.nome)}</b><span>≈ ${p.distanciaKm.toFixed(1).replace(".", ",")} km</span></div>
    <div>${esc(p.endereco)} – ${esc(p.cidade)}<br>Tel.: ${esc(p.telefone)}</div>
    <details><summary>Ver sabores</summary>${p.sabores.map(esc).join(", ")}</details>
    <div class="row" style="margin-top:8px">
      <a class="btn alt" href="tel:${p.telefone.replace(/\D/g, "")}">Entrar em contato</a>
      <button class="btn" data-pick="${p.id}">Pedir aqui</button></div></div>`).join("");
}
$("#map").addEventListener("click", (e) => {
  const pin = e.target.closest("[data-pin]");
  if (pin) { estado.pizzariaId = +pin.dataset.pin; return ir("comprar"); }
  const r = $("#map").getBoundingClientRect();
  const x = ((e.clientX - r.left) / r.width) * 600, y = ((e.clientY - r.top) / r.height) * 360;
  estado.pos = { lat: (1 - y / 360) * MAPA.lat, lng: (x / 600) * MAPA.lng };
  carregarPizzarias();
});

/* ---------- Compra ---------- */
async function renderCompra() {
  const b = $("#buy");
  if (!estado.usuario) { b.innerHTML = '<div class="msg er">Entre ou crie uma conta para fazer pedidos.</div><button class="btn" data-go="conta">Ir para Conta</button>'; return; }
  if (!estado.cardapio.length) estado.cardapio = await api("/cardapio");
  const total = estado.cardapio.reduce((s, m, i) => s + (estado.carrinho[i] || 0) * m.preco, 0);
  let meus = [];
  try { meus = await api("/pedidos/meus"); } catch (e) { /* sessão expirada */ }
  b.innerHTML = `<label>Pizzaria</label><select id="bs"><option value="">Escolha…</option>${estado.pizzarias.map((p) => `<option value="${p.id}" ${p.id === estado.pizzariaId ? "selected" : ""}>${esc(p.nome)}</option>`).join("")}</select>
    <table><tr><th>Item</th><th>Preço</th><th>Qtd</th></tr>${estado.cardapio.map((m, i) => `<tr><td>${esc(m.nome)}</td><td>${reais(m.preco)}</td><td><button class="btn" data-q="${i}:-1">−</button> ${estado.carrinho[i] || 0} <button class="btn" data-q="${i}:1">+</button></td></tr>`).join("")}</table>
    <p><b>Total: ${reais(total)}</b></p>
    <button class="btn" id="fin">Finalizar pedido</button><div id="bm"></div>
    <h2 style="margin-top:20px;font-size:20px">Meus pedidos</h2>
    ${meus.length ? `<table><tr><th>#</th><th>Pizzaria</th><th>Data</th><th>Total</th><th>Status</th></tr>${meus.map((p) => `<tr><td>${p.id}</td><td>${esc(p.pizzaria)}</td><td>${new Date(p.data).toLocaleDateString("pt-BR")}</td><td>${reais(p.valorTotal)}</td><td>${esc(p.status)}</td></tr>`).join("")}</table>` : "<p>Nenhum pedido ainda.</p>"}`;
  $("#bs").onchange = (e) => (estado.pizzariaId = +e.target.value || null);
  $("#fin").onclick = async () => {
    const itens = Object.entries(estado.carrinho).filter(([, q]) => q > 0).map(([i, q]) => ({ indice: +i, qtd: q }));
    const aviso = (t, c) => ($("#bm").innerHTML = `<div class="msg ${c}">${t}</div>`);
    if (!estado.pizzariaId) return aviso("Escolha uma pizzaria.", "er");
    if (!itens.length) return aviso("Adicione itens ao carrinho.", "er");
    try {
      await api("/pedidos", { method: "POST", body: { pizzariaId: estado.pizzariaId, itens } });
      estado.carrinho = {}; await renderCompra();
      $("#bm").innerHTML = '<div class="msg ok">Pedido realizado! Obrigado por escolher a Fazbear.</div>';
    } catch (e) { aviso(esc(e.message), "er"); }
  };
}

/* ---------- Conta ---------- */
function entrar(r) {
  localStorage.setItem("fz_token", r.token);
  estado.usuario = { id: r.id, nome: r.nome, email: r.email };
  localStorage.setItem("fz_user", JSON.stringify(estado.usuario));
  renderConta();
}
function renderConta() {
  const a = $("#acc");
  if (estado.usuario) {
    a.innerHTML = `<div class="card"><p>Logado como <b>${esc(estado.usuario.nome)}</b> (${esc(estado.usuario.email)})</p><button class="btn" id="out">Sair</button></div>`;
    $("#out").onclick = () => { localStorage.removeItem("fz_token"); localStorage.removeItem("fz_user"); estado.usuario = null; renderConta(); };
    return;
  }
  a.innerHTML = `<div class="grid">
    <form class="card" id="fl"><h3>Entrar</h3><label>E-mail</label><input id="le" type="email" required><label>Senha</label><input id="lp" type="password" required><button class="btn">Entrar</button></form>
    <form class="card" id="fc"><h3>Criar conta</h3><label>Nome</label><input id="cn" required><label>E-mail</label><input id="ce" type="email" required><label>Senha (mín. 6)</label><input id="cp" type="password" minlength="6" required><button class="btn alt">Cadastrar</button></form></div><div id="am"></div>`;
  const erro = (e) => ($("#am").innerHTML = `<div class="msg er">${esc(e.message)}</div>`);
  $("#fc").onsubmit = (e) => { e.preventDefault(); api("/auth/cadastro", { method: "POST", body: { nome: $("#cn").value, email: $("#ce").value, senha: $("#cp").value } }).then(entrar).catch(erro); };
  $("#fl").onsubmit = (e) => { e.preventDefault(); api("/auth/login", { method: "POST", body: { email: $("#le").value, senha: $("#lp").value } }).then(entrar).catch(erro); };
}

/* ---------- Ranking e pontuação ---------- */
async function renderRanking() {
  try {
    const r = await api("/pontuacoes/ranking");
    $("#rank").innerHTML = r.length ? `<table><tr><th>Jogador</th><th>Jogo</th><th>Pontos</th></tr>${r.map((x) => `<tr><td>${esc(x.jogador)}</td><td>${esc(x.jogo)}</td><td>${x.pontos}</td></tr>`).join("")}</table>` : "<p>Ainda sem pontuações.</p>";
  } catch (e) { $("#rank").innerHTML = `<div class="msg er">${esc(e.message)}</div>`; }
}
async function salvarPontos(jogo, pts) {
  if (!pts) return;
  const msg = (t, c) => $("#gbox").insertAdjacentHTML("beforeend", `<div class="msg ${c}">${t}</div>`);
  if (!estado.usuario) return msg("Entre numa conta para salvar sua pontuação.", "er");
  try { await api("/pontuacoes", { method: "POST", body: { jogo, pontos: pts } }); msg("Pontuação salva!", "ok"); renderRanking(); }
  catch (e) { msg(esc(e.message), "er"); }
}
$("#gsel").onchange = () => iniciarJogo(salvarPontos);

/* ---------- Início ---------- */
carregarConteudo();
carregarPizzarias().catch(() => {});
ir((location.hash || "#inicio").slice(1).replace(/[^a-z]/g, "") || "inicio");
if (!document.querySelector("section.on")) ir("inicio");
