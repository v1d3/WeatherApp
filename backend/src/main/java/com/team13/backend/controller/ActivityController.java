package com.team13.backend.controller;

import java.util.List;
import java.util.Map;

import org.apache.coyote.BadRequestException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.team13.backend.dto.ActivityCreationDTO;
import com.team13.backend.dto.ActivityResponseDTO;
import com.team13.backend.dto.WeatherResponseDTO;
import com.team13.backend.model.Activity;
import com.team13.backend.service.ActivityService;

import jakarta.validation.Valid;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/api/v1")
public class ActivityController {
    private final ActivityService activityService;

    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    @GetMapping("/activity")
    public ResponseEntity<List<ActivityResponseDTO>> searchActivities(@RequestParam(required = false) String weatherName,
        @RequestParam(required = false) Double temperature, @RequestParam(required = false) Double humidity, @RequestParam(required = false) Double windSpeed) {
        List<ActivityResponseDTO> activities = activityService.searchActivities(weatherName, temperature, humidity, windSpeed);
        return ResponseEntity.ok(activities);
    }

    @PostMapping("/activity")
    public ResponseEntity<ActivityResponseDTO> createActivity(@Valid @RequestBody ActivityCreationDTO activityCreationDTO) {
        try {
            Activity newActivity = activityService.createActivity(activityCreationDTO);
            List<WeatherResponseDTO> weathers = newActivity.getWeathers().stream()
                    .map(weather -> new WeatherResponseDTO(weather.getId(), weather.getName())) // Assuming you have a way to get weather name
                    .toList();
            ActivityResponseDTO activityResponseDTO = new ActivityResponseDTO(newActivity.getId(), newActivity.getName(), weathers,
                    newActivity.getMinTemperature(), newActivity.getMaxTemperature(), newActivity.getMinHumidity(),
                    newActivity.getMaxHumidity(), newActivity.getMinWindSpeed(), newActivity.getMaxWindSpeed());
            return ResponseEntity.ok(activityResponseDTO);
        } catch (BadRequestException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/activity/random")
    public ResponseEntity<ActivityResponseDTO> getRandomActivity() {
        // Obtener el usuario actual (suponiendo que hay un sistema de autenticación)
        // Si no tienes un sistema de autenticación, podrías pasar el userId como parámetro
        String userId = getUserIdFromAuthentication();
        
        List<ActivityResponseDTO> activities = activityService.searchActivities(null, null, null, null);
        if (activities.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        // Obtener los pesos de las actividades para este usuario
        Map<Long, Double> activityWeights = activityService.getActivityWeightsForUser(userId);
        
        // Aplicar softmax para seleccionar una actividad basada en los pesos
        ActivityResponseDTO selectedActivity = selectActivityUsingSoftmax(activities, activityWeights);
        
        return ResponseEntity.ok(selectedActivity);
    }

    private String getUserIdFromAuthentication() {
        // Usar la autenticación real de Spring Security
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    private ActivityResponseDTO selectActivityUsingSoftmax(List<ActivityResponseDTO> activities, Map<Long, Double> weights) {
        // Usar un valor por defecto para actividades sin peso registrado
        double defaultWeight = 1.0;
        
        // Calcular exponenciales para softmax
        double[] expWeights = new double[activities.size()];
        double sumExp = 0.0;
        
        for (int i = 0; i < activities.size(); i++) {
            // Corregir para usar el método correcto según cómo esté implementado ActivityResponseDTO
            Long activityId = activities.get(i).id(); // Si es un record, usa id()
            // O Long activityId = activities.get(i).getId(); // Si es una clase con getter
            
            // Obtener el peso o usar valor por defecto
            double weight = weights.getOrDefault(activityId, defaultWeight);
            expWeights[i] = Math.exp(weight);
            sumExp += expWeights[i];
        }
        
        // Normalizar para obtener probabilidades
        double[] probabilities = new double[activities.size()];
        for (int i = 0; i < activities.size(); i++) {
            probabilities[i] = expWeights[i] / sumExp;
        }
        
        // Selección basada en probabilidad
        double randomValue = Math.random();
        double cumulativeProbability = 0.0;
        
        for (int i = 0; i < activities.size(); i++) {
            cumulativeProbability += probabilities[i];
            if (randomValue <= cumulativeProbability) {
                return activities.get(i);
            }
        }
        
        // En caso extremo, devolver la última actividad
        return activities.get(activities.size() - 1);
    }
}

