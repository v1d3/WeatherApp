package com.team13.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.team13.backend.model.Calendar;

import java.util.List;

@Repository
public interface CalendarRepository extends JpaRepository<Calendar, Long> {
    // Add this method to delete calendars with timeInit before or equal to a given time
    void deleteByTimeInitLessThanEqual(Long timeInit);

    // Añadir al CalendarRepository
    List<Calendar> findByUserEntityId(Long userId);
}
