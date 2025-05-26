package com.team13.backend.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;


@Service
public class ForecastService {
    private final RestClient restClient;
    private final String apiKey;

    @Autowired
    private ObjectMapper objectMapper;

    public ForecastService(@Value("${weather.api.key}") String apiKey) {
        this.restClient = RestClient.create();
        this.apiKey = apiKey;
    }

    public String getForecastFromCoords(double lat, double lon) {
        String url = "http://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lon + "&appid=" + apiKey;

        return restClient.get()
            .uri(url)
            .retrieve()
            .body(String.class);
    }

    public String getForecastByCity(String city) {
        // Get latitude and longitude from geo api
        String geoUrl = "https://api.openweathermap.org/geo/1.0/direct?q=" + city + ",CL&appid=" + apiKey;

        String geoResponse = restClient.get()
            .uri(geoUrl)
            .retrieve()
            .body(String.class);

        JsonNode json;
        try {
            json = objectMapper.readValue(geoResponse, JsonNode.class);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            return null;
        }
        // Get geo coords, the api returns an array of all matching city,country. If more than one exist we use the first one
        double lat = Double.parseDouble(json.get(0).get("lat").asText());
        double lon = Double.parseDouble(json.get(0).get("lon").asText());

        String url = "http://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lon + "&appid=" + apiKey;
        return restClient.get()
            .uri(url)
            .retrieve()
            .body(String.class);
    }
}
