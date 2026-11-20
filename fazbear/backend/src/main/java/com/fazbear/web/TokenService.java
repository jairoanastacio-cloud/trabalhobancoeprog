package com.fazbear.web;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/** Token assinado (HMAC-SHA256) simples. Em produção, prefira Spring Security + JWT. */
@Service
public class TokenService {
    private static final long VALIDADE_MS = 7L * 24 * 3600 * 1000;
    @Value("${fazbear.token.secret}") private String segredo;

    public String criar(long usuarioId) {
        String corpo = usuarioId + ":" + (System.currentTimeMillis() + VALIDADE_MS);
        return b64(corpo.getBytes(StandardCharsets.UTF_8)) + "." + b64(hmac(corpo));
    }

    /** Lê o cabeçalho "Authorization: Bearer ..." e devolve o id do usuário, ou lança 401. */
    public long exigir(String cabecalho) {
        try {
            String token = cabecalho.substring("Bearer ".length());
            String[] p = token.split("\\.");
            String corpo = new String(Base64.getUrlDecoder().decode(p[0]), StandardCharsets.UTF_8);
            if (!MessageDigest.isEqual(hmac(corpo), Base64.getUrlDecoder().decode(p[1]))) throw new Exception();
            String[] c = corpo.split(":");
            if (Long.parseLong(c[1]) < System.currentTimeMillis()) throw new Exception();
            return Long.parseLong(c[0]);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Faça login para continuar.");
        }
    }

    private byte[] hmac(String texto) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(segredo.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return mac.doFinal(texto.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) { throw new IllegalStateException(e); }
    }

    private static String b64(byte[] b) { return Base64.getUrlEncoder().withoutPadding().encodeToString(b); }
}
