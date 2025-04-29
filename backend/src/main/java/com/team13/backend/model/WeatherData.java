package com.team13.backend.model;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Represent a lecture of weather in an specific location and time
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class WeatherData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    private Instant dateTime;
    @NotNull
    private String location;
    @NotNull
    private Double temperature; // Temperature in Celsius
    @NotNull
    private Integer humidity; // Humidity in percentage
    @NotNull
    private Double windSpeed; // Wind speed in km/h
    
    // Weather type (e.g., sunny, rainy, etc.), only one per weather data
    @ManyToOne(optional = false)
    private Weather weather;

    @Column(updatable = false)
    private Instant createdAt;
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}
