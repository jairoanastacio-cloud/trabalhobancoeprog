// Usa o servidor local (Spring Boot em localhost:8080) quando ele está ligado;
// senão usa o servidor simulado no navegador (modo demonstração).
(function () {
  const servidor = apiServidor, simulado = window.apiLocal;
  let decisao = null;

  async function servidorOnline() {
    if (location.protocol === "https:") return false; // página hospedada não alcança a máquina local
    try {
      const c = new AbortController(), t = setTimeout(() => c.abort(), 1500);
      const r = await fetch(window.FAZBEAR_API + "/mascotes", { signal: c.signal });
      clearTimeout(t);
      return r.ok;
    } catch (e) { return false; }
  }
  function aplicar(on) {
    const el = document.getElementById("modo");
    if (el) el.textContent = on ? " | Servidor local conectado" : " | Modo demonstração: dados salvos neste navegador";
    try { // trocar de modo invalida o login (os tokens são diferentes)
      if (localStorage.getItem("fz_modo") !== String(on)) {
        const primeira = localStorage.getItem("fz_modo") === null;
        localStorage.setItem("fz_modo", String(on));
        if (!primeira) { localStorage.removeItem("fz_token"); localStorage.removeItem("fz_user"); location.reload(); }
      }
    } catch (e) { /* armazenamento indisponível */ }
    return on;
  }

  window.api = async function (caminho, opcoes) {
    if (decisao === null) decisao = servidorOnline().then(aplicar);
    const on = await decisao;
    const dados = await (on ? servidor : simulado)(caminho, opcoes);
    if (on && caminho === "/mascotes") // imagens do banco ("img/x.png") vêm embutidas neste arquivo
      dados.forEach((m) => { const k = (m.imagem || "").match(/img\/(\w+)\.png/); if (k && window.FAZBEAR_IMG[k[1]]) m.imagem = window.FAZBEAR_IMG[k[1]]; });
    return dados;
  };
})();
