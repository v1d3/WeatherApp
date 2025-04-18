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
        if(location == null && dateTime == null) {
            List<Weather> weatherList = weatherService.getAllWeather();
            return ResponseEntity.ok(weatherList);
        }
        
        Instant dateTimeInstant = Instant.parse(dateTime);
        Weather weather = weatherService.searchWeather(location, dateTimeInstant);
        if (weather != null) {
            return ResponseEntity.ok(weather);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/weather")
    public ResponseEntity<Weather> createWeather(@Valid @RequestBody WeatherCreationDTO weatherDTO) {
        Weather weather = new Weather();
        weather.setName(weatherDTO.getName());
        weather.setDateTime(weatherDTO.getDateTime());
        weather.setLocation(weatherDTO.getLocation());
        Weather entity = weatherService.saveWeather(weather);
        return ResponseEntity.ok(entity);        
    }
    
}
