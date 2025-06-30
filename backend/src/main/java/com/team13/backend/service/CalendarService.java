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

    @Transactional(readOnly = true)
    public List<Calendar> getAllCalendars() {
        return calendarRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Calendar> getAllCalendar() {
        // Este método es solo para mantener compatibilidad
        return getAllCalendars();
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
        
        // Validar que no haya solapamiento con otras actividades
        validateNoOverlap(user, calendar.getTimestamp(), activity.getName());
        
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

    /**
     * Valida que no haya solapamiento entre actividades para un usuario
     * Asume que cada actividad dura 1 hora
     */
    private void validateNoOverlap(UserEntity user, Long newActivityTimestamp, String newActivityName) {
        // Obtener todas las actividades programadas del usuario
        List<Calendar> userCalendars = calendarRepository.findByUserEntityId(user.getId());
        
        // Duración de actividad en milisegundos (1 hora = 3600000 ms)
        final long ACTIVITY_DURATION = 3600000L;
        
        // Calcular el rango de tiempo de la nueva actividad
        long newStartTime = newActivityTimestamp;
        long newEndTime = newActivityTimestamp + ACTIVITY_DURATION;
        
        // Verificar solapamiento con actividades existentes
        for (Calendar existingCalendar : userCalendars) {
            long existingStartTime = existingCalendar.getTimeInit();
            long existingEndTime = existingStartTime + ACTIVITY_DURATION;
            
            // Verificar si hay solapamiento
            // Hay solapamiento si: (nuevo_inicio < existente_fin) Y (nuevo_fin > existente_inicio)
            if (newStartTime < existingEndTime && newEndTime > existingStartTime) {
                String existingActivityName = existingCalendar.getActivity().getName();
                
                // Formatear fechas para el mensaje de error
                java.time.Instant newInstant = java.time.Instant.ofEpochMilli(newActivityTimestamp);
                java.time.Instant existingInstant = java.time.Instant.ofEpochMilli(existingStartTime);
                
                java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter
                    .ofPattern("dd/MM/yyyy HH:mm")
                    .withZone(java.time.ZoneId.systemDefault());
                
                String newTimeStr = formatter.format(newInstant);
                String existingTimeStr = formatter.format(existingInstant);
                
                throw new RuntimeException(String.format(
                    "No se puede programar '%s' el %s porque se solapa con la actividad '%s' programada para el %s. " +
                    "Por favor, selecciona un horario diferente.",
                    newActivityName, newTimeStr, existingActivityName, existingTimeStr
                ));
            }
        }
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

    // Método para obtener calendarios de un usuario específico
    @Transactional(readOnly = true)
    public List<Calendar> getCalendarsByUsername(String username) {
        UserEntity user = userEntityRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
        List<Calendar> calendars = calendarRepository.findByUserEntityId(user.getId());
        
        // Inicializar explícitamente las colecciones para evitar LazyInitializationException
        for (Calendar calendar : calendars) {
            if (calendar.getActivity() != null) {
                Hibernate.initialize(calendar.getActivity().getWeathers());
            }
        }
        
        return calendars;
    }

    // Filtrar por el usuario actual si es necesario
    public List<Calendar> filterCalendarsByUser(List<Calendar> calendars, String username) {
        return calendars.stream()
            .filter(cal -> cal.getUserEntity() != null && cal.getUserEntity().getId().equals(username))
            .toList();
    }
}
