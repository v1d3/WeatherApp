package com.team13.backend.service;

import java.util.List;

import org.apache.coyote.BadRequestException;
import org.springframework.stereotype.Service;

import com.team13.backend.dto.WeatherCreationDTO;
import com.team13.backend.dto.WeatherResponseDTO;
import com.team13.backend.model.Weather;
import com.team13.backend.repository.WeatherRepository;

@Service
public class WeatherService {
    private final WeatherRepository weatherRepository;

    public WeatherService(WeatherRepository weatherRepository) {
        this.weatherRepository = weatherRepository;
    }

    // Weather methods
    public Weather saveWeather(WeatherCreationDTO weatherCreationDTO) throws BadRequestException {  
        if (weatherRepository.existsByName(weatherCreationDTO.getName())) {
            throw new BadRequestException("Weather already exists.");
        }
        Weather weather = new Weather();
        weather.setName(weatherCreationDTO.getName());
        return weatherRepository.save(weather);
    }

    public List<WeatherResponseDTO> getAllWeather() {
        return weatherRepository.findAll().stream()
                .map(weather -> new WeatherResponseDTO(weather.getId(), weather.getName()))
                .toList();
    }

    public WeatherResponseDTO weatherToDto(Weather weather) {
        if (weather == null) {
            return null;
        }
        return new WeatherResponseDTO(weather.getId(), weather.getName());
    }
}