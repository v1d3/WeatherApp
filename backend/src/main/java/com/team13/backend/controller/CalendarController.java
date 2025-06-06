package com.team13.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.team13.backend.dto.CalendarDTO;
import com.team13.backend.model.Calendar;
import com.team13.backend.service.CalendarService;

import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

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
    @Transactional
    public ResponseEntity<?> createCalendar(@Valid @RequestBody CalendarDTO calendar) {
        return ResponseEntity.ok(calendarService.createCalendar(calendar));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Calendar> updateCalendar(@PathVariable Long id, @Valid @RequestBody Calendar calendar) {
        if (!calendarService.getCalendarById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        calendar.setId(id);
        return ResponseEntity.ok(calendarService.updateCalendar(calendar));
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
