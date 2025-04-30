package com.team13.backend.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.apache.coyote.BadRequestException;
import org.springframework.stereotype.Service;

import com.team13.backend.dto.WeatherCreationDTO;
import com.team13.backend.dto.WeatherDataCreationDTO;
import com.team13.backend.dto.WeatherResponseDTO;
import com.team13.backend.model.Weather;
import com.team13.backend.model.WeatherData;
import com.team13.backend.repository.WeatherDataRepository;
import com.team13.backend.repository.WeatherRepository;

@Service
public class WeatherService {
    private final WeatherRepository weatherRepository;
    private final WeatherDataRepository weatherDataRepository;

    public WeatherService(WeatherRepository weatherRepository, WeatherDataRepository weatherDataRepository) {
        this.weatherRepository = weatherRepository;
        this.weatherDataRepository = weatherDataRepository;
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

    // WeatherData methods
    public List<WeatherData> searchWeatherData(String location, String dateTime) {
        // Parse dateTime string to Instant if present
        Instant dateTimeInstant = null;
        try {
            dateTimeInstant = parseDateTime(dateTime);
        } catch (Exception e) {
            throw e;
        }
        // Get all weather
        if (location == null && dateTimeInstant == null) {
            return weatherDataRepository.findAll();
        }
        // Get by location
        if (location != null && dateTimeInstant == null) {
            return weatherDataRepository.findByLocation(location);
        }
        // Get by daytime
        if (location == null && dateTimeInstant != null) {
            return weatherDataRepository.findByDateTime(dateTimeInstant);
        }
        // Get by location and daytime
        return weatherDataRepository.findByLocationAndDateTime(location, dateTimeInstant);
    }

    // Helper method to parse dateTime string to Instant
    private Instant parseDateTime(String dateTime) throws IllegalArgumentException {
        if (dateTime == null) {
            return null;
        }
        try {
            return Instant.parse(dateTime).truncatedTo(ChronoUnit.HOURS);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid date format. Use ISO-8601 format.");
        }

    }

    public WeatherData createWeatherData(WeatherDataCreationDTO weatherDTO) throws BadRequestException {
        Weather weather = weatherRepository.findById(weatherDTO.getWeatherId())
                .orElseThrow(() -> new BadRequestException("Weather not found"));

        WeatherData weatherData = new WeatherData();
        weatherData.setLocation(weatherDTO.getLocation());
        weatherData.setDateTime(weatherDTO.getDateTime().truncatedTo(ChronoUnit.HOURS));
        weatherData.setTemperature(weatherDTO.getTemperature());
        weatherData.setHumidity(weatherDTO.getHumidity());
        weatherData.setWindSpeed(weatherDTO.getWindSpeed());
        weatherData.setWeather(weather);

        return weatherDataRepository.save(weatherData);
    }
}