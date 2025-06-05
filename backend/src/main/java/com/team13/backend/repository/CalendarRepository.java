package com.team13.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.team13.backend.model.Calendar;

@Repository
public interface CalendarRepository extends JpaRepository<Calendar, Long> {
    @Transactional
    void deleteByTimeInitLessThanEqual(Long timestamp);
}
