// Três minijogos. Cada um chama salvarPontos(jogo, pontos) no fim.
let pontos = 0, relogio = null;
const setPontos = (n) => { pontos = n; document.getElementById("gp").textContent = n; };

function iniciarJogo(salvarPontos) {
  clearInterval(relogio);
  const jogo = document.getElementById("gsel").value, box = document.getElementById("gbox");
  setPontos(0);

  if (jogo === "A") { // Pegue a pizza: clique o máximo em 20 s
    box.innerHTML = '<button class="btn" id="st">Começar (20 s)</button> <span id="tm"></span><div id="arena"><span id="pz"></span></div>';
    document.getElementById("st").onclick = () => {
      setPontos(0);
      let t = 20;
      const pz = document.getElementById("pz"), arena = document.getElementById("arena");
      const mover = () => { pz.style.left = Math.random() * (arena.clientWidth - 40) + "px"; pz.style.top = Math.random() * (arena.clientHeight - 40) + "px"; };
      mover();
      pz.onclick = () => { if (t > 0) { setPontos(pontos + 10); mover(); } };
      document.getElementById("tm").textContent = t + "s";
      clearInterval(relogio);
      relogio = setInterval(() => {
        t--; document.getElementById("tm").textContent = t + "s";
        if (t <= 0) { clearInterval(relogio); salvarPontos("A", pontos); }
      }, 1000);
    };
  }

  if (jogo === "B") { // Sequência da banda: repita a ordem das cores
    const cores = ["#c0201e", "#f5c518", "#4b2a7a", "#2c7a1a"];
    let seq = [], i = 0, minhaVez = false;
    box.innerHTML = '<button class="btn" id="st">Começar</button> <span id="tm"></span><div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">'
      + cores.map((c, k) => `<button class="gbtn" data-k="${k}" style="background:${c}"></button>`).join("") + "</div>";
    const acender = (k) => { const e = box.querySelector(`[data-k="${k}"]`); e.classList.add("lit"); setTimeout(() => e.classList.remove("lit"), 350); };
    const rodada = () => {
      minhaVez = false; seq.push(Math.floor(Math.random() * 4)); i = 0;
      seq.forEach((k, j) => setTimeout(() => acender(k), 600 * (j + 1)));
      setTimeout(() => { minhaVez = true; document.getElementById("tm").textContent = "Sua vez!"; }, 600 * seq.length + 500);
    };
    document.getElementById("st").onclick = () => { seq = []; setPontos(0); rodada(); };
    box.onclick = (e) => {
      const k = e.target.dataset && e.target.dataset.k;
      if (k === undefined || !minhaVez) return;
      acender(+k);
      if (+k !== seq[i]) { minhaVez = false; document.getElementById("tm").textContent = "Errou!"; salvarPontos("B", pontos); seq = []; return; }
      i++;
      if (i === seq.length) { setPontos(seq.length * 10); setTimeout(rodada, 700); }
    };
  }

  if (jogo === "C") { // Reflexo do Foxy: clique quando ficar verde (5 rodadas)
    box.innerHTML = '<button class="btn" id="st">Começar (5 rodadas)</button><div id="arena" style="display:flex;align-items:center;justify-content:center;color:#fff;font-size:22px;cursor:pointer;text-align:center">Clique em “Começar”</div>';
    const arena = document.getElementById("arena");
    let rodadas = 0, verde = false, t0 = 0, total = 0, espera, ativo = false;
    const proxima = () => {
      verde = false; arena.style.background = "#c0201e"; arena.textContent = "Espere o verde…";
      espera = setTimeout(() => { verde = true; t0 = Date.now(); arena.style.background = "#2c7a1a"; arena.textContent = "AGORA!"; }, 1000 + Math.random() * 2500);
    };
    document.getElementById("st").onclick = () => { clearTimeout(espera); rodadas = 0; total = 0; ativo = true; setPontos(0); proxima(); };
    arena.onclick = () => {
      if (!ativo) return;
      if (!verde) { clearTimeout(espera); ativo = false; arena.textContent = "Cedo demais! Clique em Começar."; return; }
      total += Math.max(0, 1000 - (Date.now() - t0)); rodadas++; setPontos(Math.round(total));
      if (rodadas >= 5) { ativo = false; verde = false; arena.style.background = "#2a1608"; arena.textContent = "Fim! " + Math.round(total) + " pontos"; salvarPontos("C", pontos); }
      else proxima();
    };
  }
}
