package com.team13.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
public class AuthResponseDTO {
    private String token;
    private final String tokenType = "Bearer";
}
