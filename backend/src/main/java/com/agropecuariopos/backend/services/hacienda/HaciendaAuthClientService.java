package com.agropecuariopos.backend.services.hacienda;

import com.agropecuariopos.backend.dto.hacienda.HaciendaTokenResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;

@Service
public class HaciendaAuthClientService {

    private static final Logger logger = LoggerFactory.getLogger(HaciendaAuthClientService.class);

    @Value("${hacienda.api.token.url}")
    private String tokenUrl;

    @Value("${hacienda.api.client.id}")
    private String clientId;

    @Value("${hacienda.api.username}")
    private String username;

    @Value("${hacienda.api.password}")
    private String password;

    private String currentToken;
    private LocalDateTime tokenExpiration;

    public synchronized String getValidAccessToken() {
        if (currentToken != null && tokenExpiration != null && LocalDateTime.now().isBefore(tokenExpiration)) {
            return currentToken;
        }

        logger.info("Solicitando nuevo token OIDC a Ministerio de Hacienda...");

        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("client_id", clientId);
        map.add("grant_type", "password");
        map.add("username", username);
        map.add("password", password);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);

        try {
            ResponseEntity<HaciendaTokenResponse> response = restTemplate.postForEntity(
                    tokenUrl, request, HaciendaTokenResponse.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                this.currentToken = response.getBody().getAccessToken();
                // Token dura típicamente 5 minutos, guardamos margen de 30s de seguridad
                this.tokenExpiration = LocalDateTime.now().plusSeconds(response.getBody().getExpiresIn() - 30);
                return this.currentToken;
            } else {
                throw new RuntimeException(
                        "Error autenticando con Ministerio de Hacienda. Status: " + response.getStatusCode());
            }
        } catch (Exception e) {
            logger.error("Error crítico obteniendo token de Hacienda: {}", e.getMessage());
            throw new RuntimeException("Fallo de comunicación OIDC con el Ministerio", e);
        }
    }
}
