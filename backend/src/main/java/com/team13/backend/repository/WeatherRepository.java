package com.team13.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.team13.backend.model.Weather;

@Repository
public interface WeatherRepository extends JpaRepository<Weather, Long> {
    Weather findByName(String name);
    boolean existsByName(String name);
    
}
