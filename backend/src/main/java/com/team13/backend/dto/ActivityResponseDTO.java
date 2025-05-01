package com.team13.backend.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class ActivityResponseDTO {
    private Long id;
    private String name;
    private List<WeatherResponseDTO> weathers;
    private Double minTemperature;
    private Double maxTemperature;
    private Double minHumidity;
    private Double maxHumidity;
    private Double minWindSpeed;
    private Double maxWindSpeed;
}
