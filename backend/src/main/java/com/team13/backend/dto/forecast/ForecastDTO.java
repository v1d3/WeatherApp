package com.team13.backend.dto.forecast;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Forecast for 5 days from now
@NoArgsConstructor @AllArgsConstructor
@Getter @Setter
public class ForecastDTO {
    // Readings of weather grouped by day (Local date Chile)
    private Map<LocalDate, DayForecast> dailyForecast = new LinkedHashMap<>();
}
