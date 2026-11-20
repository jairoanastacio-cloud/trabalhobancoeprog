// Servidor da máquina local (Spring Boot). Se o site for aberto pelo próprio servidor
// (http://localhost:8080) usa "/api"; abrindo o index.html direto, aponta para localhost:8080.
window.FAZBEAR_API = location.protocol === "http:" && location.port === "8080" ? "/api" : "http://localhost:8080/api";
// Limites do mapa esquemático (graus do mapa). Devem cobrir as coordenadas do banco.
window.FAZBEAR_MAPA = { lat: 0.036, lng: 0.06 };
