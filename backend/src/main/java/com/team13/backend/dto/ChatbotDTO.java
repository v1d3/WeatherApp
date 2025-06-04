package com.team13.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

//@Data
public class ChatbotDTO {

    @JsonProperty("question")
    private String question;

    public ChatbotDTO() {
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        System.out.println("SETTER: " + question);
        this.question = question;
    }

    @Override
    public String toString() {
        return "ChatbotDTO{question='" + question + "'}";
    }
}
