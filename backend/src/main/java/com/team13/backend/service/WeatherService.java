package com.team13.backend.service;

import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;

import com.team13.backend.dto.WeatherCreationDTO;
import com.team13.backend.model.Weather;
import com.team13.backend.repository.WeatherRepository;

import jakarta.validation.Valid;

@Service
public class WeatherService {
    private final WeatherRepository weatherRepository;

    public WeatherService(WeatherRepository weatherRepository) {
        this.weatherRepository = weatherRepository;
    }

    public Weather saveWeather(Weather weather) {
        return weatherRepository.save(weather);
    }

    public List<Weather> searchWeather(String location, String dateTime) {
        // Parse dateTime string to Instant if present
        Instant dateTimeInstant = null;
        try{
            dateTimeInstant = parseDateTime(dateTime);
        } catch (Exception e) {
            throw e;
        }
        // Get all weather
        if(location == null && dateTimeInstant == null) {
            return weatherRepository.findAll();
        }
        // Get by location
        if(location != null && dateTimeInstant == null) {
            return weatherRepository.findByLocation(location);
        }
        // Get by daytime
        if(location == null && dateTimeInstant != null) {
            return weatherRepository.findByDateTime(dateTimeInstant);
        }
        // Get by location and daytime
        return weatherRepository.findByLocationAndDateTime(location, dateTimeInstant);
    }

    // Helper method to parse dateTime string to Instant
    private Instant parseDateTime(String dateTime) throws IllegalArgumentException {
        if (dateTime == null) {
            return null;
        }
        try {
            return Instant.parse(dateTime);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid date format. Use ISO-8601 format.");
        }

    }

    public Weather createWeather(WeatherCreationDTO weatherDTO) {
        Weather weather = new Weather();
        weather.setName(weatherDTO.getName());
        weather.setLocation(weatherDTO.getLocation());
        weather.setDateTime(weatherDTO.getDateTime());
        return saveWeather(weather);
    }
}