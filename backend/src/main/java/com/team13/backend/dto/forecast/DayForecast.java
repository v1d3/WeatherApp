package com.team13.backend.dto.forecast;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.LinkedHashMap;
import java.util.Map;

@NoArgsConstructor @AllArgsConstructor
@Getter @Setter
public class DayForecast {
    // Readings of weather, every 3 hour, {LocalTime: Weather}
    private Map<LocalTime, HourForecast> hourlyForecasts = new LinkedHashMap<>();
    private Double minTemperature = Double.MAX_VALUE;          // min temperature of the day
    private Double maxTemperature = Double.MIN_VALUE;          // max temperature of the day
    private HourForecast primaryWeather;    // The most important weather of the day!!
    private LocalDate dateLocalCL;          // Day
}
