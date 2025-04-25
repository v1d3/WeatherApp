package com.team13.backend.controller;

import java.time.Instant;
import java.util.List;

import org.apache.coyote.BadRequestException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.team13.backend.dto.WeatherCreationDTO;
import com.team13.backend.dto.WeatherDataCreationDTO;
import com.team13.backend.dto.WeatherResponseDTO;
import com.team13.backend.model.Weather;
import com.team13.backend.model.WeatherData;
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
    

    // WeatherData methods
    @GetMapping("/weather-data")
    public ResponseEntity<List<WeatherData>> searchWeatherData(@RequestParam(required = false) String location, @RequestParam(required = false) String dateTime){
        try{
            List<WeatherData> weather = weatherService.searchWeatherData(location, dateTime);
            if (weather != null) {
                return ResponseEntity.ok(weather);
            } 
            return ResponseEntity.notFound().build(); // I'm 90% sure this is unreachable, but just in case.
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // TODO: Use a DTO for the response
    @PostMapping("/weather-data")
    public ResponseEntity<WeatherData> createWeatherData(@Valid @RequestBody WeatherDataCreationDTO weatheDataDTO) {
        WeatherData newWeather;
        try {
            newWeather = weatherService.createWeatherData(weatheDataDTO);
        } catch (BadRequestException e) {
            return ResponseEntity.badRequest().build();
        }
        if(newWeather == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(newWeather);
    }
    
}
