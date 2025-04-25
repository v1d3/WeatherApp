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
}
