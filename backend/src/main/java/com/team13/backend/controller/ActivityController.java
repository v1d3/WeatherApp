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
    public ResponseEntity<List<Activity>> searchActivities(@RequestParam(required = false) String weatherName) {
        List<Activity> activities = activityService.getActivitiesByWeatherName(weatherName);
        return ResponseEntity.ok(activities);
    }

    @PostMapping("/activity")
    public ResponseEntity<ActivityResponseDTO> createActivity(@Valid @RequestBody ActivityCreationDTO activityCreationDTO) {
        try {
            Activity newActivity = activityService.createActivity(activityCreationDTO);
            List<WeatherResponseDTO> weathers = newActivity.getWeathers().stream()
                    .map(weather -> new WeatherResponseDTO(weather.getId(), weather.getName())) // Assuming you have a way to get weather name
                    .toList(); 
            ActivityResponseDTO activityResponseDTO = new ActivityResponseDTO(newActivity.getId(), newActivity.getName(), weathers);
            return ResponseEntity.ok(activityResponseDTO);
        } catch (BadRequestException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
