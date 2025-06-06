package com.team13.backend.dto.activity;

import java.util.List;

import com.team13.backend.dto.WeatherResponseDTO;

public record DActivityResponseDTO(
    Long id,
    String name,
    Double minTemperature,
    Double maxTemperature,
    Double minHumidity,
    Double maxHumidity,
    Double minWindSpeed,
    Double maxWindSpeed,
    List<WeatherResponseDTO> weathers,
    List<TagResponseDTO> tags
) {
}
