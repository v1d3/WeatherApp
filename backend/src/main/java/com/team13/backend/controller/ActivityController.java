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

import com.team13.backend.dto.TagResponseDTO;
import com.team13.backend.dto.WeatherResponseDTO;
import com.team13.backend.dto.activity.ActivityCreationDTO;
import com.team13.backend.dto.activity.ActivityModificationDTO;
import com.team13.backend.dto.activity.ActivityResponseDTO;
import com.team13.backend.dto.activity.DActivityCreationDTO;
import com.team13.backend.dto.activity.DActivityResponseDTO;
import com.team13.backend.model.Activity;
import com.team13.backend.service.ActivityService;

import jakarta.validation.Valid;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/api/v1/activity")
public class ActivityController {
    private final ActivityService activityService;

    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    @GetMapping("")
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
                Long defaultId = defaultActivity.id();
                if (!customizedDefaultIds.containsKey(defaultId)) {
                    activities.add(defaultActivity);
                }
            }
        }

        return ResponseEntity.ok(activities);
    }

    @PostMapping("")
    public ResponseEntity<ActivityResponseDTO> createActivity(
            @Valid @RequestBody ActivityCreationDTO activityCreationDTO) {
        try {
            Activity newActivity = activityService.createActivity(activityCreationDTO);
            List<WeatherResponseDTO> weathers = newActivity.getWeathers().stream()
                    .map(weather -> new WeatherResponseDTO(weather.getId(), weather.getName()))
                    .toList();

            List<TagResponseDTO> tags = newActivity.getTags().stream()
                    .map(tag -> new TagResponseDTO(tag.getId(), tag.getName()))
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
                    newActivity.getWasCustomized() != null ? newActivity.getWasCustomized() : false,
                    newActivity.getWeight(), tags);
            return ResponseEntity.ok(activityResponseDTO);
        } catch (BadRequestException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/random")
    public ResponseEntity<ActivityResponseDTO> getRandomActivity(
            @RequestParam(required = false) String weatherName,
            @RequestParam(required = false) Double temperature,
            @RequestParam(required = false) Double humidity,
            @RequestParam(required = false) Double windSpeed) {

        // Get current user
        String userId = getUserIdFromAuthentication();

        // Get only user-specific activities (from activities table)
        List<ActivityResponseDTO> userActivities;

        if (weatherName != null || temperature != null || humidity != null || windSpeed != null) {
            // If we have weather parameters, use them to filter activities
            userActivities = activityService.searchActivitiesByUserAndFilters(userId,
                    weatherName, temperature, humidity, windSpeed);
        } else {
            // If no weather parameters provided, get all user activities without filters
            userActivities = activityService.searchActivitiesByUser(userId);
        }

        // Return 404 if no activities found
        if (userActivities.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        // Get weights for user activities
        Map<Long, Double> activityWeights = activityService.getActivityWeightsForUser(userId);
        Double defaultWeight = 1.0; // Default weight for activities without specific weight

        // Use softmax to select a random activity
        ActivityResponseDTO selectedActivity = selectActivityUsingSoftmax(userActivities, activityWeights,
                defaultWeight);

        return ResponseEntity.ok(selectedActivity);
    }

    @PutMapping("/weight/{id}")
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

    @PutMapping("/{id}")
    public ResponseEntity<ActivityResponseDTO> modifyActivity(
            @PathVariable Long id,
            @RequestParam(required = false) Boolean isDefault,
            @Valid @RequestBody ActivityModificationDTO modificationDTO) {

        try {
            // Obtener el usuario actual desde la autenticación
            String username = SecurityContextHolder.getContext().getAuthentication().getName();

            ActivityResponseDTO updatedActivity = activityService.modifyActivity(
                    username,
                    id,
                    modificationDTO,
                    isDefault != null && isDefault);

            return ResponseEntity.ok(updatedActivity);
        } catch (Exception e) {
            System.err.println("Error updating activity: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteActivity(@PathVariable Long id) {
        try {
            boolean deleted = activityService.deleteActivity(id);
            if (deleted) {
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(403).build();
        } catch (Exception e) {
            System.out.println(e);
            return ResponseEntity.badRequest().build();
        }
    }

    private String getUserIdFromAuthentication() {
        // Usar la autenticación real de Spring Security
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    private ActivityResponseDTO selectActivityUsingSoftmax(List<ActivityResponseDTO> activities,
            Map<Long, Double> weights, Double defaultWeight) {
        
        // Define el factor de temperatura (ajustable según tus necesidades)
        double temperature = 0.8; // Valores recomendados: 0.5-2.0
        
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

            // Aplicar temperatura dividiendo el peso por el factor de temperatura
            expWeights[i] = Math.exp(weight / temperature);
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
