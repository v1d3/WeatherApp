package com.team13.backend.controller;

import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.team13.backend.service.ChatbotService;

import io.swagger.v3.oas.annotations.parameters.RequestBody;

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

        String question = chatbotDTO.getQuestion();
        if (question == null || question.isEmpty()) {
            return ResponseEntity.badRequest().body("La pregunta no puede estar vacía");
        }
        String answer = chatbotService.ask(question);
        return ResponseEntity.ok(answer);
    }
}
