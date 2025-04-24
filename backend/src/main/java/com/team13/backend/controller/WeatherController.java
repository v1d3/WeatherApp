package com.team13.backend.controller;

import java.time.Instant;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.team13.backend.dto.WeatherCreationDTO;
import com.team13.backend.model.Weather;
import com.team13.backend.service.WeatherService;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api/v1")
public class WeatherController {
    private final WeatherService weatherService;

    public WeatherController(WeatherService weatherService) {
        this.weatherService = weatherService;
    }

    @GetMapping("/weather")
    public ResponseEntity<?> searchWeather(@RequestParam(required = false) String location, @RequestParam(required = false) String dateTime){
        try{
            List<Weather> weather = weatherService.searchWeather(location, dateTime);
            if (weather != null) {
                return ResponseEntity.ok(weather);
            } 
            return ResponseEntity.notFound().build(); // I'm 90% sure this is unreachable, but just in case.
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid date format. Use ISO-8601 format.");
        }
    }
    
    @PostMapping("/weather")
    public ResponseEntity<Weather> createWeather(@Valid @RequestBody WeatherCreationDTO weatherDTO) {
        Weather newWeather = weatherService.createWeather(weatherDTO);
        if(newWeather == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(newWeather);
    }
    
}
