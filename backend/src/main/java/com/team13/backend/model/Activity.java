package com.team13.backend.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Activity {
    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    private Long id;
    @NotNull
    private String name;
    @NotEmpty
    @ManyToMany
    @JoinTable(
        name = "weather_activities",
        joinColumns = @JoinColumn(name = "activity_id", referencedColumnName = "id"),
        inverseJoinColumns = @JoinColumn(name = "weather_id", referencedColumnName = "id"))
    private List<Weather> weathers = new ArrayList<>();

    @NotNull @Min(-274) @Max(100)
    private Double minTemperature;
    @NotNull @Min(-274) @Max(100)
    private Double maxTemperature;
    @NotNull @Min(0) @Max(100)
    private Double minHumidity;
    @NotNull @Min(0) @Max(100)
    private Double maxHumidity;
    @NotNull @Min(0)
    private Double minWindSpeed;
    @NotNull @Min(0)
    private Double maxWindSpeed;

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
