-- Referência do modelo (o Spring cria as tabelas sozinho via ddl-auto=update).
CREATE TABLE usuarios  (id_usuario BIGSERIAL PRIMARY KEY, nome VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL UNIQUE, senha_hash VARCHAR(255) NOT NULL);
CREATE TABLE pizzarias (id_pizzaria BIGSERIAL PRIMARY KEY, nome VARCHAR(255), endereco VARCHAR(255), cidade VARCHAR(255), latitude DOUBLE PRECISION, longitude DOUBLE PRECISION, telefone VARCHAR(50), sabores VARCHAR(500));
CREATE TABLE pedidos   (id_pedido BIGSERIAL PRIMARY KEY, id_usuario BIGINT NOT NULL REFERENCES usuarios, id_pizzaria BIGINT NOT NULL REFERENCES pizzarias, data_pedido TIMESTAMP, valor_total NUMERIC(10,2), status VARCHAR(30));
CREATE TABLE mascotes  (id_mascote BIGSERIAL PRIMARY KEY, nome VARCHAR(255), descricao VARCHAR(500), historia TEXT, imagem VARCHAR(500));
CREATE TABLE noticias  (id_noticia BIGSERIAL PRIMARY KEY, titulo VARCHAR(255), texto TEXT, data DATE);
CREATE TABLE pontuacoes(id_pontuacao BIGSERIAL PRIMARY KEY, id_usuario BIGINT NOT NULL REFERENCES usuarios, jogo VARCHAR(1), pontos INT, data TIMESTAMP);
