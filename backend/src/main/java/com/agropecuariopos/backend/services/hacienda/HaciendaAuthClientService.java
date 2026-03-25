package com.agropecuariopos.backend.services.hacienda;

import com.agropecuariopos.backend.dto.hacienda.HaciendaTokenResponse;
import com.agropecuariopos.backend.models.CompanySettings;
import com.agropecuariopos.backend.repositories.CompanySettingsRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
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

    @Autowired
    private CompanySettingsRepository settingsRepository;

    private String currentToken;
    private LocalDateTime tokenExpiration;

    public void invalidateToken() {
        this.currentToken = null;
        this.tokenExpiration = null;
        logger.warn("Token de Hacienda invalidado manualmente.");
    }

    public synchronized String getValidAccessToken() {
        CompanySettings settings = settingsRepository.findFirst()
                .orElseThrow(() -> new RuntimeException("No se encontró la configuración de la empresa en la base de datos."));

        String username = settings.getHaciendaUsername();
        String password = settings.getHaciendaPassword();
        String clientId = settings.getHaciendaClientId();
        String tokenUrl = settings.getHaciendaTokenUrl();

        if (username == null || username.isBlank() || 
            password == null || password.isBlank() || 
            clientId == null || clientId.isBlank() || 
            tokenUrl == null || tokenUrl.isBlank()) {
            
            StringBuilder missing = new StringBuilder();
            if (username == null || username.isBlank()) missing.append("Username, ");
            if (password == null || password.isBlank()) missing.append("Password, ");
            if (clientId == null || clientId.isBlank()) missing.append("ClientId, ");
            if (tokenUrl == null || tokenUrl.isBlank()) missing.append("TokenUrl, ");
            
            String msg = "Credenciales de Hacienda incompletas: " + missing.toString();
            throw new RuntimeException(msg.substring(0, msg.length() - 2));
        }

        if (currentToken != null && tokenExpiration != null && LocalDateTime.now().isBefore(tokenExpiration)) {
            return currentToken;
        }

        System.out.println("=== HACIENDA AUTH DEBUG ===");
        System.out.println("User: " + username);
        System.out.println("Pass: " + password);
        System.out.println("Client ID: " + clientId);
        System.out.println("URL: " + tokenUrl);
        System.out.println("===========================");

        logger.info("Solicitando nuevo token OIDC a Ministerio de Hacienda...");

        // Configurar RestTemplate con timeouts para evitar bloqueos
        org.springframework.http.client.SimpleClientHttpRequestFactory factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10000); // 10s
        factory.setReadTimeout(15000);    // 15s
        RestTemplate restTemplate = new RestTemplate(factory);

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

            HaciendaTokenResponse body = response.getBody();
            if (response.getStatusCode().is2xxSuccessful() && body != null && body.getAccessToken() != null) {
                this.currentToken = body.getAccessToken();
                // Token dura típicamente 5 minutos, guardamos margen de 30s de seguridad
                this.tokenExpiration = LocalDateTime.now().plusSeconds(body.getExpiresIn() - 30);
                return this.currentToken;
            }
            this.currentToken = null; // Limpiar token si hubo error o body null
            if (body != null && body.getAccessToken() == null) {
                 throw new RuntimeException("El servidor de Hacienda no proporcionó un Access Token en la respuesta.");
            }
            String errorMsg = "Error autenticando con Hacienda. Status: " + response.getStatusCode();
            if (body != null) {
                errorMsg += " - " + body.toString();
            }
            throw new RuntimeException(errorMsg);
        } catch (Exception e) {
            this.currentToken = null; // Limpiar token si hubo excepción
            logger.error("Error crítico obteniendo token de Hacienda: {} - Causa: {}", e.getMessage(), 
                    e.getCause() != null ? e.getCause().getMessage() : "N/A", e);
            throw new RuntimeException("Fallo de comunicación OIDC con el Ministerio: " + e.getMessage(), e);
        }
    }
}
