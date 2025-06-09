package com.team13.backend.controller;

import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.team13.backend.service.ChatbotService;

//import io.swagger.v3.oas.annotations.parameters.RequestBody;
import org.springframework.web.bind.annotation.RequestBody;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.team13.backend.dto.ChatbotDTO;

@RestController
@RequestMapping("/api/v1/chatbot")
public class ChatbotController {

    private final ChatbotService chatbotService;

    public ChatbotController(ChatbotService chatbotService) {
        this.chatbotService = chatbotService;
    }

    @PostMapping("/ask")

    public ResponseEntity<String> ask(@RequestBody ChatbotDTO chatbotDTO) {
        try {
            System.out.println("DTO recibido: " + chatbotDTO.toString());

            if (chatbotDTO.getQuestion() == null || chatbotDTO.getQuestion().isEmpty()) {
                return ResponseEntity.badRequest().body("El texto no puede estar vacío");
            }

            System.out.println("Enviando JSON: " + new ObjectMapper().writeValueAsString(chatbotDTO));
            String data = chatbotDTO.getQuestion();
            String answer = chatbotService.ask(data);
            return ResponseEntity.ok(answer);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }
}
