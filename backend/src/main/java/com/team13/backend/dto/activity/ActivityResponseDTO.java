package com.team13.backend.dto.activity;

import java.util.List;

import com.team13.backend.dto.WeatherResponseDTO;

public record ActivityResponseDTO(
        Long id,
        String name,
        List<WeatherResponseDTO> weathers,
        Double minTemperature,
        Double maxTemperature,
        Double minHumidity,
        Double maxHumidity,
        Double minWindSpeed,
        Double maxWindSpeed,
        Long defaultActivityId,
        Boolean wasCustomized) {
}
