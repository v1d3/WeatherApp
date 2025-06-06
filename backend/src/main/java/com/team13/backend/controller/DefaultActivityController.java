package com.team13.backend.controller;

import java.util.List;

import org.apache.coyote.BadRequestException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.team13.backend.dto.activity.DActivityCreationDTO;
import com.team13.backend.dto.activity.DActivityResponseDTO;
import com.team13.backend.service.DefaultActivityService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/activity/default")
public class DefaultActivityController {

    @Autowired
    private DefaultActivityService defaultActivityService;

     @GetMapping("")
    public ResponseEntity<List<DActivityResponseDTO>> getDefaultActivities() {
        List<DActivityResponseDTO> defaultActivities = defaultActivityService.getDefaultActivitiesAsDTO();
        return ResponseEntity.ok(defaultActivities);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DActivityResponseDTO> getDefaultActivityById(@PathVariable Long id) {
        DActivityResponseDTO defaultActivity = defaultActivityService.getDefaultActivityById(id);
        if (defaultActivity != null) {
            return ResponseEntity.ok(defaultActivity);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping("")
    public ResponseEntity<DActivityResponseDTO> createDefaultActivity(@Valid @RequestBody DActivityCreationDTO activityCreationDTO) {
        try {
            DActivityResponseDTO createdActivity = defaultActivityService.createDefaultActivity(activityCreationDTO);
            return ResponseEntity.ok(createdActivity);
        } catch (BadRequestException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<DActivityResponseDTO> updateDefaultActivity(@PathVariable Long id, @Valid @RequestBody DActivityCreationDTO activityCreationDTO) {
        DActivityResponseDTO updatedActivity = defaultActivityService.updateDefaultActivity(id, activityCreationDTO);
        return ResponseEntity.ok(updatedActivity);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDefaultActivity(@PathVariable Long id) {
        boolean deleted = defaultActivityService.deleteDefaultActivity(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
