package com.team13.backend.dto.forecast;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalTime;

@NoArgsConstructor @AllArgsConstructor
@Getter @Setter
public class HourForecast {
    private Long unixTime;          // Unix time in seconds
    private String weather;         // Sunny, Rainy, etc.
    private String description;     // Specific weather condition within weather group, eg: light rain.
    private Double temperature;     // Temperature °C
    private Double precipitation;   // Probability of precipitation, 0-1
    private Long humidity;          // % humidity
    private Double windSpeed;       // m/s
    private String icon;            // Icon id of open weather api
    private Instant timestampUTC;   // Iso time of reading UTC
    private LocalTime timeLocalCL;  // hour of reading, local time Chile (GMT-4)
}
