package com.team13.backend.controller;

import org.apache.coyote.BadRequestException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.team13.backend.dto.ActivityCreationDTO;
import com.team13.backend.dto.ActivityResponseDTO;
import com.team13.backend.service.ActivityService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/user-activity")
public class UserActivityController {
    
    private final ActivityService activityService;
    
    public UserActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }
    
    @PostMapping("/customize-default/{id}")
    public ResponseEntity<ActivityResponseDTO> customizeDefaultActivity(
            @PathVariable Long id,
            @Valid @RequestBody ActivityCreationDTO customizationData) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            ActivityResponseDTO customizedActivity = activityService.customizeDefaultActivity(username, id, customizationData);
            return ResponseEntity.ok(customizedActivity);
        } catch (BadRequestException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}