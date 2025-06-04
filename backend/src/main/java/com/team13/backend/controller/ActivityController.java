package com.team13.backend.controller;

import java.util.ArrayList;
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
    public ResponseEntity<List<ActivityResponseDTO>> searchActivities(
            @RequestParam(required = false) String weatherName,
            @RequestParam(required = false) Double temperature, @RequestParam(required = false) Double humidity,
            @RequestParam(required = false) Double windSpeed) {
        List<ActivityResponseDTO> activities = activityService.searchActivities(weatherName, temperature, humidity,
                windSpeed);
        return ResponseEntity.ok(activities);
    }

    @PostMapping("/activity")
    public ResponseEntity<ActivityResponseDTO> createActivity(
            @Valid @RequestBody ActivityCreationDTO activityCreationDTO) {
        try {
            Activity newActivity = activityService.createActivity(activityCreationDTO);
            List<WeatherResponseDTO> weathers = newActivity.getWeathers().stream()
                    .map(weather -> new WeatherResponseDTO(weather.getId(), weather.getName())) // Assuming you have a
                                                                                                // way to get weather
                                                                                                // name
                    .toList();
            ActivityResponseDTO activityResponseDTO = new ActivityResponseDTO(newActivity.getId(),
                    newActivity.getName(), weathers,
                    newActivity.getMinTemperature(), newActivity.getMaxTemperature(), newActivity.getMinHumidity(),
                    newActivity.getMaxHumidity(), newActivity.getMinWindSpeed(), newActivity.getMaxWindSpeed());
            return ResponseEntity.ok(activityResponseDTO);
        } catch (BadRequestException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/activity/random")
    public ResponseEntity<ActivityResponseDTO> getRandomActivity() {
        // Get current user
        String userId = getUserIdFromAuthentication();
        
        // Get user-specific activities
        List<ActivityResponseDTO> userActivities = activityService.searchActivitiesByUser(userId);
        
        // Get default activities for all users
        List<ActivityResponseDTO> defaultActivities = activityService.getDefaultActivitiesAsDTO();
        
        // Combine both lists
        List<ActivityResponseDTO> allActivities = new ArrayList<>();
        allActivities.addAll(userActivities);
        allActivities.addAll(defaultActivities);
        
        if (allActivities.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        // Get weights for user activities
        Map<Long, Double> activityWeights = activityService.getActivityWeightsForUser(userId);
        
        // Apply default weight for default activities (which have negative IDs)
        Double defaultWeight = 1.0; // Default weight for default activities
        
        // Use softmax to select a random activity
        ActivityResponseDTO selectedActivity = selectActivityUsingSoftmax(allActivities, activityWeights, defaultWeight);
        
        return ResponseEntity.ok(selectedActivity);
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
