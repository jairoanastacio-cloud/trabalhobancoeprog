# Fazbear Entertainment – Site oficial (1993)

Trabalho escolar: site com **servidor na própria máquina** (localhost).

```
fazbear/
├── backend/      API Java (Spring Boot 3, Java 17, Maven) – serve a API e também o site
├── frontend/     HTML + CSS + JS (index.html, css/, js/, img/)
├── database/     schema.sql (referência das tabelas)
├── standalone/   fazbear-site.html: o site em UM arquivo (abre sem instalar nada) + build.py
└── docker-compose.yml  PostgreSQL opcional
```

## Rodar no seu computador (precisa de Java 17+ e Maven)
**Com PostgreSQL** (conforme o enunciado): crie o banco/usuário/senha `fazbear` (ou `docker compose up -d`) e rode:
```
cd backend
mvn spring-boot:run
```
**Sem PostgreSQL** (banco em arquivo, nada para instalar): 
```
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=h2
```
Depois abra **http://localhost:8080** – o mesmo servidor entrega o site e a API (`/api/...`).
Rode o comando dentro da pasta `backend` (ele procura o site em `../frontend`).
Também funciona abrir `frontend/index.html` ou `standalone/fazbear-site.html` com duplo clique, com o servidor ligado:
eles encontram o servidor em localhost:8080 sozinhos. Sem o servidor, o `fazbear-site.html` entra em modo demonstração
(dados salvos no navegador) e mostra isso no rodapé.

## Onde editar
| Quero mudar…                  | Arquivo |
|-------------------------------|---------|
| Cores, fontes, layout         | `frontend/css/style.css` (variáveis no topo) |
| Imagens                       | `frontend/img/` (fundo: `--fundo` no CSS) |
| Pizzarias, notícias, mascotes | `backend/src/main/java/com/fazbear/DadosIniciais.java` (só roda com o banco vazio) ou direto no banco |
| Cardápio e preços             | `PedidoController.CARDAPIO` |
| Minijogos                     | `frontend/js/games.js` |
| Gerar o arquivo único         | `python3 standalone/build.py` |

Para recarregar os dados iniciais: apague o banco (`docker compose down -v`, ou a pasta `backend/dados` no perfil h2).

## Endpoints
`POST /api/auth/cadastro` · `POST /api/auth/login` · `GET /api/noticias` · `GET /api/mascotes`
`GET /api/pizzarias?lat=&lng=` · `GET /api/cardapio` · `POST /api/pedidos` · `GET /api/pedidos/meus`
`POST /api/pontuacoes` · `GET /api/pontuacoes/ranking` (pedidos e pontuações exigem `Authorization: Bearer <token>`)
