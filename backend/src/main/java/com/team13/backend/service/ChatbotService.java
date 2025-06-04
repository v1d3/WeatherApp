package com.team13.backend.service;

import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class ChatbotService {
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    @Autowired
    public ChatbotService(ObjectMapper objectMapper) {
        this.restClient = RestClient.create();
        this.objectMapper = objectMapper;
    }

    public String ask(String question) {
        if (question == null) {
            throw new IllegalArgumentException("La pregunta no puede ser null");
        }
        Map<String, String> request = Map.of("question", question);
        String url = "http://localhost:8000/api/ask";

        String responsejson = restClient.post().uri(url).body(request).retrieve().body(String.class);

        try {
            JsonNode json = objectMapper.readTree(responsejson);
            return json.get("response").asText();
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            return null;
        }
    }

}
