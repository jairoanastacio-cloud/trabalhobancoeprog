// Chamadas à API. O token de login fica no localStorage.
async function api(caminho, opcoes = {}) {
  const token = localStorage.getItem("fz_token");
  const resposta = await fetch(window.FAZBEAR_API + caminho, {
    method: opcoes.method || "GET",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}) },
    body: opcoes.body ? JSON.stringify(opcoes.body) : undefined,
  });
  const texto = await resposta.text();
  const dados = texto ? JSON.parse(texto) : null;
  if (!resposta.ok) throw new Error((dados && dados.message) || "Erro " + resposta.status);
  return dados;
}
