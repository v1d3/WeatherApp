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

import com.team13.backend.model.Calendar;
import com.team13.backend.service.CalendarService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/calendar")
public class CalendarController {

    @Autowired
    private CalendarService calendarService;

    @GetMapping
    public ResponseEntity<List<Calendar>> getAllCalendar() {
        return ResponseEntity.ok(calendarService.getAllCalendar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Calendar> getCalendarById(@PathVariable Long id) {
        Optional<Calendar> calendar = calendarService.getCalendarById(id);
        return calendar.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Calendar> createCalendar(@Valid @RequestBody Calendar calendar) {
        Calendar savedCalendar = calendarService.saveCalendar(calendar);
        return new ResponseEntity<>(savedCalendar, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Calendar> updateCalendar(@PathVariable Long id, @Valid @RequestBody Calendar calendar) {
        if (!calendarService.getCalendarById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        calendar.setId(id);
        return ResponseEntity.ok(calendarService.saveCalendar(calendar));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCalendar(@PathVariable Long id) {
        if (!calendarService.getCalendarById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        calendarService.deleteCalendar(id);
        return ResponseEntity.noContent().build();
    }
}
