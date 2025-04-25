package com.team13.backend.dto;

import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class WeatherDataResponseDTO {
    private Long id;
    private WeatherResponseDTO weather;
    private Instant dateTime;
    private String location;
}
