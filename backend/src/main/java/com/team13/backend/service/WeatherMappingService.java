package com.team13.backend.service;

import org.springframework.stereotype.Service;
import com.team13.backend.model.Weather;
import com.team13.backend.repository.WeatherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

@Service
public class WeatherMappingService {
    
    private final WeatherRepository weatherRepository;
    private final Map<String, String> apiToDbMapping;
    
    @Autowired
    public WeatherMappingService(WeatherRepository weatherRepository) {
        this.weatherRepository = weatherRepository;
        this.apiToDbMapping = createWeatherMapping();
    }
    
    private Map<String, String> createWeatherMapping() {
        Map<String, String> mapping = new HashMap<>();

        // Grupo 2xx: Tormentas
        mapping.put("Thunderstorm", "Tormenta");
        mapping.put("Thunderstorm with light rain", "Tormenta");
        mapping.put("Thunderstorm with rain", "Tormenta");
        mapping.put("Thunderstorm with heavy rain", "Tormenta");
        mapping.put("Light thunderstorm", "Tormenta");
        mapping.put("Heavy thunderstorm", "Tormenta");
        mapping.put("Ragged thunderstorm", "Tormenta");
        mapping.put("Thunderstorm with light drizzle", "Tormenta");
        mapping.put("Thunderstorm with drizzle", "Tormenta");
        mapping.put("Thunderstorm with heavy drizzle", "Tormenta");
        
        // Grupo 3xx: Llovizna
        mapping.put("Drizzle", "Llovizna");
        mapping.put("Light intensity drizzle", "Llovizna");
        mapping.put("Drizzle rain", "Llovizna");
        mapping.put("Heavy intensity drizzle", "Llovizna");
        mapping.put("Light intensity drizzle rain", "Llovizna");
        mapping.put("Heavy intensity drizzle rain", "Llovizna");
        mapping.put("Shower rain and drizzle", "Llovizna");
        mapping.put("Heavy shower rain and drizzle", "Llovizna");
        mapping.put("Shower drizzle", "Llovizna");
        
        // Grupo 5xx: Lluvia
        mapping.put("Rain", "Lluvia");
        mapping.put("Light rain", "Lluvia");
        mapping.put("Moderate rain", "Lluvia");
        mapping.put("Heavy intensity rain", "Lluvia");
        mapping.put("Very heavy rain", "Lluvia");
        mapping.put("Extreme rain", "Lluvia");
        mapping.put("Freezing rain", "Lluvia");
        mapping.put("Light intensity shower rain", "Lluvia");
        mapping.put("Shower rain", "Lluvia");
        mapping.put("Heavy intensity shower rain", "Lluvia");
        mapping.put("Ragged shower rain", "Lluvia");
        
        // Grupo 6xx: Nieve
        mapping.put("Snow", "Nieve");
        mapping.put("Light snow", "Nieve");
        mapping.put("Heavy snow", "Nieve");
        mapping.put("Sleet", "Nieve");
        mapping.put("Light shower sleet", "Nieve");
        mapping.put("Shower sleet", "Nieve");
        mapping.put("Light rain and snow", "Nieve");
        mapping.put("Rain and snow", "Nieve");
        mapping.put("Light shower snow", "Nieve");
        mapping.put("Shower snow", "Nieve");
        mapping.put("Heavy shower snow", "Nieve");
        
        // Grupo 7xx: Atmósfera
        mapping.put("Mist", "Neblina");
        mapping.put("Smoke", "Neblina");
        mapping.put("Haze", "Neblina");
        mapping.put("Sand/dust whirls", "Polvo");
        mapping.put("Fog", "Niebla");
        mapping.put("Sand", "Polvo");
        mapping.put("Dust", "Polvo");
        mapping.put("Volcanic ash", "Ceniza");
        mapping.put("Squalls", "Ráfagas");
        mapping.put("Tornado", "Tornado");
        
        // Grupo 800: Despejado
        mapping.put("Clear", "Despejado");
        mapping.put("Clear sky", "Despejado");
        
        // Grupo 80x: Nubes
        mapping.put("Clouds", "Nublado");
        mapping.put("Few clouds", "Parcialmente nublado");
        mapping.put("Scattered clouds", "Parcialmente nublado");
        mapping.put("Broken clouds", "Nublado");
        mapping.put("Overcast clouds", "Muy nublado");
        
        // Mapeo para códigos numéricos (por si recibes el código en lugar del nombre)
        // Estos son los códigos principales, puedes expandirlos según necesites
        
        // Asegurar que siempre hay un valor por defecto
        return mapping;
    }
    
    public Weather mapApiWeatherToDbWeather(String apiWeatherName) {
        // Convierte el nombre de la API a un nombre en tu BD
        String dbWeatherName = apiToDbMapping.getOrDefault(apiWeatherName, "despejado");
        
        // Busca el Weather en la BD por nombre
        Optional<Weather> weatherOpt = weatherRepository.findByName(dbWeatherName);
        
        if (weatherOpt.isPresent()) {
            return weatherOpt.get();
        } else {
            // Si no hay un mapeo, busca un tipo de clima por defecto (ej. "despejado")
            Optional<Weather> defaultWeather = weatherRepository.findByName("despejado");
            
            if (defaultWeather.isPresent()) {
                return defaultWeather.get();
            } else {
                return null;
            }
        }
    }
    
    // Método para obtener el mapeo completo (útil para endpoints de la API)
    public Map<String, String> getWeatherMapping() {
        return new HashMap<>(apiToDbMapping);
    }
}