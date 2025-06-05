package com.team13.backend.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.team13.backend.model.DefaultActivity;
import com.team13.backend.service.DefaultActivityService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/default-activity")
public class DefaultActivityController {

    @Autowired
    private DefaultActivityService defaultActivityService;

    @GetMapping
    public ResponseEntity<List<DefaultActivity>> getAllDefaultActivities() {
        return ResponseEntity.ok(defaultActivityService.getAllDefaultActivities());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DefaultActivity> getDefaultActivityById(@PathVariable Long id) {
        Optional<DefaultActivity> defaultActivity = defaultActivityService.getDefaultActivityById(id);
        return defaultActivity.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<DefaultActivity> createDefaultActivity(@Valid @RequestBody DefaultActivity defaultActivity) {
        DefaultActivity savedActivity = defaultActivityService.saveDefaultActivity(defaultActivity);
        return new ResponseEntity<>(savedActivity, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DefaultActivity> updateDefaultActivity(@PathVariable Long id, @Valid @RequestBody DefaultActivity defaultActivity) {
        if (!defaultActivityService.getDefaultActivityById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        defaultActivity.setId(id);
        return ResponseEntity.ok(defaultActivityService.saveDefaultActivity(defaultActivity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDefaultActivity(@PathVariable Long id) {
        if (!defaultActivityService.getDefaultActivityById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        defaultActivityService.deleteDefaultActivity(id);
        return ResponseEntity.noContent().build();
    }
}
