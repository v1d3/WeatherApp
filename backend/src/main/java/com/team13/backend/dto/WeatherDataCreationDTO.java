package com.team13.backend.dto;

import java.time.Instant;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class WeatherDataCreationDTO {
    @NotNull
    private Long weatherId;
    @NotNull
    private Instant dateTime;
    @NotNull
    private String location;
    @NotNull
    private Double temperature; // Temperature in Celsius
    @NotNull
    private Integer humidity; // Humidity in percentage
    @NotNull
    private Double windSpeed; // Wind Speed in km/h

}
