package com.team13.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.team13.backend.model.WeatherData;
import java.time.Instant;


@Repository
public interface WeatherDataRepository extends JpaRepository<WeatherData, Long> {
    List<WeatherData> findByLocationAndDateTime(String location, Instant dateTime);
    List<WeatherData> findByLocation(String location);
    List<WeatherData> findByDateTime(Instant dateTimeInstant);
    
}
