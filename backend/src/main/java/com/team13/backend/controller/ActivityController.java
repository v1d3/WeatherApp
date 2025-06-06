package com.team13.backend.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.coyote.BadRequestException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;

import com.team13.backend.dto.WeatherResponseDTO;
import com.team13.backend.dto.activity.ActivityCreationDTO;
import com.team13.backend.dto.activity.ActivityResponseDTO;
import com.team13.backend.dto.activity.DActivityCreationDTO;
import com.team13.backend.dto.activity.DActivityResponseDTO;
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
    public ResponseEntity<List<ActivityResponseDTO>> searchActivities(
            @RequestParam(required = false) String weatherName,
            @RequestParam(required = false) Double temperature,
            @RequestParam(required = false) Double humidity,
            @RequestParam(required = false) Double windSpeed) {

        // Obtener el usuario actual
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        List<ActivityResponseDTO> activities;
        if (weatherName != null || temperature != null || humidity != null || windSpeed != null) {
            // Si hay filtros, usar una versión que combine filtrado por parámetros y por
            // usuario
            activities = activityService.searchActivitiesByUserAndFilters(username,
                    weatherName, temperature, humidity, windSpeed);
        } else {
            // Obtener actividades del usuario
            List<ActivityResponseDTO> userActivities = activityService.searchActivitiesByUser(username);

            // Obtener actividades predeterminadas
            List<ActivityResponseDTO> defaultActivities = activityService.getDefaultActivitiesAsDTO();

            // Identificar qué actividades predeterminadas ya tienen versiones
            // personalizadas
            Map<Long, Boolean> customizedDefaultIds = new HashMap<>();
            for (ActivityResponseDTO userActivity : userActivities) {
                // Las actividades personalizadas tienen un campo defaultActivity no nulo
                if (userActivity.defaultActivityId() != null) {
                    // Guardar el ID de la actividad predeterminada que ya tiene versión
                    // personalizada
                    customizedDefaultIds.put(userActivity.defaultActivityId(), true);
                }
            }

            // Combinar las listas, excluyendo las predeterminadas que ya tienen versiones
            // personalizadas
            activities = new ArrayList<>(userActivities);
            for (ActivityResponseDTO defaultActivity : defaultActivities) {
                Long defaultId = -defaultActivity.id(); // Convertir ID negativo a positivo
                if (!customizedDefaultIds.containsKey(defaultId)) {
                    activities.add(defaultActivity);
                }
            }
        }

        return ResponseEntity.ok(activities);
    }

    @PostMapping("/activity")
    public ResponseEntity<ActivityResponseDTO> createActivity(
            @Valid @RequestBody ActivityCreationDTO activityCreationDTO) {
        try {
            Activity newActivity = activityService.createActivity(activityCreationDTO);
            List<WeatherResponseDTO> weathers = newActivity.getWeathers().stream()
                    .map(weather -> new WeatherResponseDTO(weather.getId(), weather.getName()))
                    .toList();
            ActivityResponseDTO activityResponseDTO = new ActivityResponseDTO(
                    newActivity.getId(),
                    newActivity.getName(),
                    weathers,
                    newActivity.getMinTemperature(),
                    newActivity.getMaxTemperature(),
                    newActivity.getMinHumidity(),
                    newActivity.getMaxHumidity(),
                    newActivity.getMinWindSpeed(),
                    newActivity.getMaxWindSpeed(),
                    newActivity.getDefaultActivity() != null ? newActivity.getDefaultActivity().getId() : null,
                    newActivity.getWasCustomized() != null ? newActivity.getWasCustomized() : false);
            return ResponseEntity.ok(activityResponseDTO);
        } catch (BadRequestException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/activity/random")
    public ResponseEntity<ActivityResponseDTO> getRandomActivity(
            @RequestParam(required = false) String weatherName,
            @RequestParam(required = false) Double temperature,
            @RequestParam(required = false) Double humidity,
            @RequestParam(required = false) Double windSpeed) {

        // Get current user
        String userId = getUserIdFromAuthentication();

        // Get filtered activities based on weather parameters and user
        List<ActivityResponseDTO> filteredActivities;
        if (weatherName != null || temperature != null || humidity != null || windSpeed != null) {
            // If we have weather parameters, use them to filter activities
            filteredActivities = activityService.searchActivitiesByUserAndFilters(userId,
                    weatherName, temperature, humidity, windSpeed);
        } else {
            // If no weather parameters provided, get all activities

            // Get user-specific activities
            List<ActivityResponseDTO> userActivities = activityService.searchActivitiesByUser(userId);

            // Get default activities for all users
            List<ActivityResponseDTO> defaultActivities = activityService.getDefaultActivitiesAsDTO();

            // Combine both lists but handle customized activities
            Map<Long, Boolean> customizedDefaultIds = new HashMap<>();
            for (ActivityResponseDTO userActivity : userActivities) {
                if (userActivity.defaultActivityId() != null) {
                    customizedDefaultIds.put(userActivity.defaultActivityId(), true);
                }
            }

            // Add user activities
            filteredActivities = new ArrayList<>(userActivities);

            // Add default activities that aren't customized
            for (ActivityResponseDTO defaultActivity : defaultActivities) {
                Long defaultId = -defaultActivity.id(); // Convert negative ID to positive
                if (!customizedDefaultIds.containsKey(defaultId)) {
                    filteredActivities.add(defaultActivity);
                }
            }
        }

        if (filteredActivities.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        // Get weights for user activities
        Map<Long, Double> activityWeights = activityService.getActivityWeightsForUser(userId);

        // Apply default weight for default activities (which have negative IDs)
        Double defaultWeight = 1.0; // Default weight for default activities

        // Use softmax to select a random activity
        ActivityResponseDTO selectedActivity = selectActivityUsingSoftmax(filteredActivities, activityWeights,
                defaultWeight);

        // Check if the selected activity is a default activity (negative ID)
        if (selectedActivity.id() < 0) {
            // It's a default activity - check if the user has a customized version
            Long defaultActivityId = -selectedActivity.id(); // Convert back to positive ID
            ActivityResponseDTO customizedActivity = activityService.findCustomizedDefaultActivity(userId,
                    defaultActivityId);

            // If customized version exists, return it instead
            if (customizedActivity != null) {
                return ResponseEntity.ok(customizedActivity);
            }
        }

        // Otherwise return the originally selected activity
        return ResponseEntity.ok(selectedActivity);
    }

    @PutMapping("/activity/weight/{id}")
    public ResponseEntity<ActivityResponseDTO> updateActivityWeight(
            @PathVariable Long id,
            @RequestBody Map<String, Double> weightMap) {
        
        try {
            // Obtener el usuario actual desde la autenticación
            String userId = getUserIdFromAuthentication();
            
            // Extraer el nuevo peso del cuerpo de la solicitud
            Double newWeight = weightMap.get("weight");
            if (newWeight == null) {
                return ResponseEntity.badRequest().build();
            }
            
            // Imprimir para depuración
            System.out.println("Actualizando peso para actividad " + id + ": " + newWeight);
            
            // Llamar al servicio para actualizar el peso de la actividad
            ActivityResponseDTO updatedActivity = activityService.updateActivityWeight(userId, id, newWeight);
            return ResponseEntity.ok(updatedActivity);
        } catch (Exception e) {
            System.err.println("Error actualizando peso: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    private String getUserIdFromAuthentication() {
        // Usar la autenticación real de Spring Security
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    private ActivityResponseDTO selectActivityUsingSoftmax(List<ActivityResponseDTO> activities,
            Map<Long, Double> weights, Double defaultWeight) {
        // Use a default value for activities without a registered weight

        // Calculate exponentials for softmax
        double[] expWeights = new double[activities.size()];
        double sumExp = 0.0;

        for (int i = 0; i < activities.size(); i++) {
            Long activityId = activities.get(i).id();

            // If ID is negative, it's a default activity
            double weight;
            if (activityId < 0) {
                weight = defaultWeight;
            } else {
                weight = weights.getOrDefault(activityId, defaultWeight);
            }

            expWeights[i] = Math.exp(weight);
            sumExp += expWeights[i];
        }

        // Normalize to get probabilities
        double[] probabilities = new double[activities.size()];
        for (int i = 0; i < activities.size(); i++) {
            probabilities[i] = expWeights[i] / sumExp;
        }

        // Selection based on probability
        double randomValue = Math.random();
        double cumulativeProbability = 0.0;

        for (int i = 0; i < activities.size(); i++) {
            cumulativeProbability += probabilities[i];
            if (randomValue <= cumulativeProbability) {
                return activities.get(i);
            }
        }

        // In extreme case, return the last activity
        return activities.get(activities.size() - 1);
    }
}
