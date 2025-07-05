package com.team13.backend.dto;

import java.util.List;

public record CalendarActivityDTO(
    Long id,
    String name,
    List<WeatherResponseDTO> weathers
) {}