package com.team13.backend.service;

import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;

import com.team13.backend.model.Weather;
import com.team13.backend.repository.WeatherRepository;

@Service
public class WeatherService {
    private final WeatherRepository weatherRepository;

    public WeatherService(WeatherRepository weatherRepository) {
        this.weatherRepository = weatherRepository;
    }

    public Weather saveWeather(Weather weather) {
        return weatherRepository.save(weather);
    }

    public List<Weather> getAllWeather() {
        return weatherRepository.findAll();
    }

    public Weather searchWeather(String location, Instant dateTime) {
        return weatherRepository.findByLocationAndDateTime(location, dateTime).orElse(null);
    }

}
