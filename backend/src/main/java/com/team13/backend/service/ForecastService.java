package com.team13.backend.service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.team13.backend.dto.forecast.DayForecast;
import com.team13.backend.dto.forecast.ForecastDTO;
import com.team13.backend.dto.forecast.HourForecast;
import com.team13.backend.model.Weather;
import com.team13.backend.service.WeatherMappingService;

enum WeatherPriority {
    CLEAR(0),
    CLOUDS(5),
    MIST(10), HAZE(10), FOG(10),
    DRIZZLE(20), SQUALL(20),
    RAIN(30),
    THUNDERSTORM(40),
    SNOW(50),
    UNKNOWN(-1);

    private final int value;

    WeatherPriority(int value){
        this.value = value;
    }

    public int getValue(){
        return value;
    }

    public static final WeatherPriority fromString(String weather){
        if(weather == null || weather.isEmpty()) return UNKNOWN;
        for(WeatherPriority type : values()){
            if(weather.toUpperCase().contains(type.name())){
                return type;
            }
        }
        return UNKNOWN;
    }
}

@Service
public class ForecastService {
    private final RestClient restClient;
    private final String apiKey;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private WeatherMappingService weatherMappingService;  // Añadir esta dependencia

    private record Coords(Double lat, Double lon) {}

    public ForecastService(@Value("${weather.api.key}") String apiKey) {
        this.restClient = RestClient.create();
        this.apiKey = apiKey;
    }

    private Coords getCoordsByCity(String city) {
        // Get latitude and longitude from geo api
        String geoUrl = "https://api.openweathermap.org/geo/1.0/direct?q=" + city + ",CL&appid=" + apiKey;
        String geoResponse = restClient.get().uri(geoUrl).retrieve().body(String.class);
        JsonNode json;
        try {
            json = objectMapper.readValue(geoResponse, JsonNode.class);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            return null;
        }

        // Get geo coords, the api returns an array of all matching city,country. If more than one exist uses the first one
        double lat = Double.parseDouble(json.get(0).get("lat").asText());
        double lon = Double.parseDouble(json.get(0).get("lon").asText());

        return new Coords(lat, lon);
    }

    public String getRawForecastByCoords(double lat, double lon) {
        String url = "http://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lon + "&units=metric&appid=" + apiKey;
        return restClient.get().uri(url).retrieve().body(String.class);
    }

    public String getRawWeatherByCoords(double lat, double lon) {
        String url = "http://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&units=metric&appid=" + apiKey;
        return restClient.get().uri(url).retrieve().body(String.class);
    }

    public ForecastDTO getWeatherForecastByCoords(double lat, double lon) {
        String forecastData = getRawForecastByCoords(lat, lon);
        String currentData = getRawWeatherByCoords(lat, lon);

        JsonNode forecastJson, currentJson;
        try {
            forecastJson = objectMapper.readValue(forecastData, JsonNode.class).get("list");
            currentJson = objectMapper.readValue(currentData, JsonNode.class);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }

        ForecastDTO forecastDTO = new ForecastDTO();
        // Load data of current weather
        HourForecast currentWeather = createHourForecast(currentJson);
        DayForecast _dayForecast = new DayForecast();
        _dayForecast.setMaxTemperature(currentWeather.getTemperature());
        _dayForecast.setMinTemperature(currentWeather.getTemperature());
        _dayForecast.setPrimaryWeather(currentWeather);
        _dayForecast.getHourlyForecasts().put(currentWeather.getTimeLocalCL(), currentWeather);
        _dayForecast.setDateLocalCL(currentWeather.getTimestampUTC().atZone(ZoneId.of("America/Santiago")).toLocalDate());
        forecastDTO.getDailyForecast().put(_dayForecast.getDateLocalCL(), _dayForecast);

        for(JsonNode weather : forecastJson){
            // Only get 5 days from today inclusive, because last day forecast might not be complete
            LocalDate weatherDateCL = Instant.ofEpochSecond(weather.path("dt").asLong()).atZone(ZoneId.of("America/Santiago")).toLocalDate();
            if(!forecastDTO.getDailyForecast().containsKey(weatherDateCL)){
                if(forecastDTO.getDailyForecast().size() >= 5) break;
                DayForecast dayForecast = new DayForecast();
                dayForecast.setDateLocalCL(weatherDateCL);
                forecastDTO.getDailyForecast().put(weatherDateCL, dayForecast);
            }
            DayForecast currentDayForecast = forecastDTO.getDailyForecast().get(weatherDateCL);
            HourForecast mappedWeather = createHourForecast(weather);
            if(mappedWeather.getTemperature() < currentDayForecast.getMinTemperature()) currentDayForecast.setMinTemperature(mappedWeather.getTemperature());
            if(mappedWeather.getTemperature() > currentDayForecast.getMaxTemperature()) currentDayForecast.setMaxTemperature(mappedWeather.getTemperature());
            // Only check the most important weather between 9am and 10pm because who cares what weather is in the night
            // But put the first one by default even if is not in that range
            if(currentDayForecast.getPrimaryWeather() == null) currentDayForecast.setPrimaryWeather(mappedWeather);

            if (WeatherPriority.fromString(currentDayForecast.getPrimaryWeather().getWeather()).getValue() <
                    WeatherPriority.fromString(mappedWeather.getWeather()).getValue() &&
                    mappedWeather.getTimeLocalCL().isAfter(LocalTime.of(8, 0)) &&
                    mappedWeather.getTimeLocalCL().isBefore(LocalTime.of(22, 0))) {
                currentDayForecast.setPrimaryWeather(mappedWeather);
            }
            currentDayForecast.getHourlyForecasts().put(mappedWeather.getTimeLocalCL(), mappedWeather);
        }
        
        return forecastDTO;
    }

    HourForecast createHourForecast(JsonNode json) {
        HourForecast forecast = new HourForecast();
        
        // Código existente para llenar el forecast
        String weatherName = json.path("weather").get(0).path("main").asText();
        forecast.setWeather(weatherName);
        forecast.setDescription(json.path("weather").get(0).path("description").asText());
        forecast.setIcon(json.path("weather").get(0).path("icon").asText());
        forecast.setWindSpeed(json.path("wind").path("speed").asDouble());
        forecast.setTemperature(json.path("main").path("temp").asDouble());
        forecast.setHumidity(json.path("main").path("humidity").asLong());
        // Porability of rain is not present for current weather
        if(!json.path("pop").isMissingNode()){
            forecast.setPrecipitation(json.path("pop").asDouble());
        } else {
            forecast.setPrecipitation(-1.0);
        }
        // weather.setPrecipitation(json.path("pop") != null ? json.get("pop").asDouble() : -1);
        

        // TODO: maybe get rain mm volume? i didn't knew what does it mean so i just skipped it

        forecast.setUnixTime(json.get("dt").asLong());
        forecast.setTimestampUTC(Instant.ofEpochSecond(forecast.getUnixTime()));
        forecast.setTimeLocalCL(forecast.getTimestampUTC().atZone(ZoneId.of("America/Santiago")).toLocalTime().truncatedTo(ChronoUnit.MINUTES));

        // Eliminar todos los logs para mejorar rendimiento
        
        // Mapeo sin logging
        Weather dbWeather = weatherMappingService.mapApiWeatherToDbWeather(weatherName);
        if (dbWeather != null) {
            forecast.setDbWeatherId(dbWeather.getId());
            forecast.setDbWeatherName(dbWeather.getName());
        }
        
        return forecast;
    }

    public ForecastDTO getWeatherForecastByCity(String city) {
        Coords coords = getCoordsByCity(city);
        return getWeatherForecastByCoords(coords.lat(), coords.lon());
    }
}
