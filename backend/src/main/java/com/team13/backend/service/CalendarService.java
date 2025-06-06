package com.team13.backend.service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.team13.backend.model.Calendar;
import com.team13.backend.repository.CalendarRepository;

@Service
public class CalendarService {

    @Autowired
    private CalendarRepository calendarRepository;

    @Scheduled(fixedRate = 3600000) // every hour
    public void scheduledDeleteOldCalendars() {
        deleteOldCalendars();
    }

    public List<Calendar> getAllCalendar() {
        return calendarRepository.findAll();
    }

    public Optional<Calendar> getCalendarById(Long id) {
        return calendarRepository.findById(id);
    }

    public Calendar saveCalendar(Calendar calendar) {
        return calendarRepository.save(calendar);
    }

    public void deleteCalendar(Long id) {
        calendarRepository.deleteById(id);
    }
    
    public void deleteOldCalendars() {
        Long now = Instant.now().toEpochMilli();
        calendarRepository.deleteByTimeInitLessThanEqual(now);
    }
}
