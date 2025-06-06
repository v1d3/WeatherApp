package com.team13.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.team13.backend.dto.forecast.ForecastDTO;
import com.team13.backend.service.ForecastService;


@RestController
@RequestMapping("/api/v1/forecast")
public class ForecastController {
    private final ForecastService forecastService;

    public ForecastController (ForecastService forecastService){
        this.forecastService = forecastService;
    }

    @GetMapping("/coords")
    public ResponseEntity<ForecastDTO> getForecastByCoords(@RequestParam double lat, @RequestParam double lon) {
        return ResponseEntity.ok(forecastService.getWeatherForecastByCoords(lat, lon));
    }

    @GetMapping("/city")
    public ResponseEntity<ForecastDTO> getForecastByCoords(@RequestParam String name) {
        return ResponseEntity.ok(forecastService.getWeatherForecastByCity(name));
    }
    
}
