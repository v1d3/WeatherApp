package com.team13.backend.controller;

import java.util.List;

import org.apache.coyote.BadRequestException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.team13.backend.dto.WeatherCreationDTO;
import com.team13.backend.dto.WeatherResponseDTO;
import com.team13.backend.model.Weather;
import com.team13.backend.service.WeatherService;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;


@RestController
@RequestMapping("/api/v1")
public class WeatherController {
    private final WeatherService weatherService;

    public WeatherController(WeatherService weatherService) {
        this.weatherService = weatherService;
    }

    // Weather methods
    @GetMapping("/weather")
    public ResponseEntity<List<WeatherResponseDTO>> getAllWeather() {
        List<WeatherResponseDTO> weather = weatherService.getAllWeather();
        if (weather != null) {
            return ResponseEntity.ok(weather);
        } 
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/weather")
    public ResponseEntity<Weather> createWeather(@Valid @RequestBody WeatherCreationDTO weatherDTO) {
        Weather newWeather;
        try {
            newWeather = weatherService.saveWeather(weatherDTO);
        } catch (BadRequestException e) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(newWeather);
    }
}
