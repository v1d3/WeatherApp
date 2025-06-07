package com.team13.backend.dto;

import java.util.List;

public record ActivityDTO(
    Long id,
    String name,
    List<WeatherResponseDTO> weathers
) {}