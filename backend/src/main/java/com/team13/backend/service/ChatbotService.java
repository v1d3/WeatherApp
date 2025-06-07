package com.team13.backend.service;

import java.util.Map;
import java.util.Collections;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

@Service
public class ChatbotService {

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    @Autowired
    public ChatbotService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.restTemplate = new RestTemplate();
    }

    public String ask(String rawText) {
        if (rawText == null || rawText.trim().isEmpty()) {
            throw new IllegalArgumentException("Texto vacío recibido");
        }

        String url = "http://localhost:8000/api/ask";

        Map<String, String> request = Collections.singletonMap("question", rawText.trim());
        System.out.println("JSON enviado al microservicio: " + request);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, String>> requestEntity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);
            String responseBody = response.getBody();

            System.out.println("Respuesta cruda del microservicio: " + responseBody);

            if (responseBody == null || responseBody.trim().isEmpty()) {
                throw new RuntimeException("El microservicio devolvió una respuesta vacía.");
            }

            JsonNode json = objectMapper.readTree(responseBody);
            System.out.println("JSON procesado: " + json.toPrettyString());

            if (json.has("response")) {
                return json.get("response").asText();
            } else {
                throw new RuntimeException("Clave 'response' no encontrada en JSON.");
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error al llamar al microservicio: " + e.getMessage());
        }

    }
}
