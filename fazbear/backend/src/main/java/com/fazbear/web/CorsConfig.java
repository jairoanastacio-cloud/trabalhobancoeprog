package com.fazbear.web;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** Permite o front-end (outra porta/domínio) chamar a API. Defina CORS_ORIGENS em produção. */
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Value("${fazbear.cors.origens}") private String origens;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**").allowedOrigins(origens.split(",")).allowedMethods("GET", "POST", "PUT", "DELETE");
    }
}
