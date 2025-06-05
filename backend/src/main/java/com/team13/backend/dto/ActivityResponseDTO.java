package com.team13.backend.dto;

import java.util.List;

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
