package com.team13.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.team13.backend.model.Weather;
import java.time.Instant;


@Repository
public interface WeatherRepository extends JpaRepository<Weather, Long> {
    List<Weather> findByName(String name);
    List<Weather> findByLocationAndDateTime(String location, Instant dateTime);
    List<Weather> findByLocation(String location);
    List<Weather> findByDateTime(Instant dateTimeInstant);
}
