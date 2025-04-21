package com.team13.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.team13.backend.model.Weather;
import java.time.Instant;


@Repository
public interface WeatherRepository extends JpaRepository<Weather, Long> {
    Optional<Weather> findByName(String name);
    Optional<Weather> findByLocationAndDateTime(String location, Instant dateTime);
}
