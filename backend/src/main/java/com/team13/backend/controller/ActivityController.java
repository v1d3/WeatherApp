package com.team13.backend.controller;

import java.util.List;

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
        List<ActivityResponseDTO> activities = activityService.searchActivities(null, null, null, null);
        if (activities.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        ActivityResponseDTO randomActivity = activities.get(new java.util.Random().nextInt(activities.size()));
        return ResponseEntity.ok(randomActivity);
    }
}
