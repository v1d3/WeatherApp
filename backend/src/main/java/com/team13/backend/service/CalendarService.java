package com.team13.backend.service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.team13.backend.model.Calendar;
import com.team13.backend.model.Activity;
import com.team13.backend.model.UserEntity;
import com.team13.backend.repository.CalendarRepository;
import com.team13.backend.repository.ActivityRepository;
import com.team13.backend.repository.UserEntityRepository;
import com.team13.backend.dto.CalendarDTO;
import com.team13.backend.dto.CalendarResponseDTO;

@Service
public class CalendarService {
    @Autowired
    private CalendarRepository calendarRepository;
    
    @Autowired
    private UserEntityRepository userEntityRepository;
    
    @Autowired
    private ActivityRepository activityRepository;

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
    
    @Transactional
    public CalendarResponseDTO createCalendar(CalendarDTO calendar) {

        Activity activity = activityRepository.findById(calendar.getActivity_id())
            .orElseThrow(() -> new RuntimeException("Activity not found"));

        // Buscar al usuario por username en lugar de por ID
        UserEntity user = userEntityRepository.findByUsername(calendar.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found with username: " + calendar.getUsername()));
        
        // Set the fully loaded entities
        Calendar calendar2 = new Calendar();

        calendar2.setTimeInit(calendar.getTimestamp());
        calendar2.setActivity(activity);
        calendar2.setUserEntity(user);
        
        Calendar savedCalendar = calendarRepository.save(calendar2);
        return new CalendarResponseDTO(
            savedCalendar.getId(), 
            savedCalendar.getTimeInit(), 
            savedCalendar.getActivity().getId(), 
            savedCalendar.getUserEntity().getId()
        );
    }

    @Transactional
    public void deleteOldCalendars() {
        Long now = Instant.now().toEpochMilli();
        calendarRepository.deleteByTimeInitLessThanEqual(now);
    }
    
    @Transactional
    public Calendar updateCalendarTimestamp(Long id, Long newTimestamp) {
        Calendar calendar = calendarRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Calendar not found"));
        
        calendar.setTimeInit(newTimestamp);
        return calendarRepository.save(calendar);
    }

    @Transactional
    public Calendar updateCalendar(Calendar calendar) {
        // Check if calendar exists
        calendarRepository.findById(calendar.getId())
            .orElseThrow(() -> new RuntimeException("Calendar not found"));
        
        // Save the updated calendar
        return calendarRepository.save(calendar);
    }
}
