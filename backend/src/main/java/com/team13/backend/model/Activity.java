package com.team13.backend.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
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
    private Long activity_id;
    
    public Long getId() {
        return activity_id;
    }
    
    @NotNull
    private String name;
    
    @NotEmpty
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "weather_activities",
        joinColumns = @JoinColumn(name = "activity_id", referencedColumnName = "activity_id"),
        inverseJoinColumns = @JoinColumn(name = "weather_id", referencedColumnName = "id"))
    private List<Weather> weathers = new ArrayList<>();

    @NotNull @DecimalMin(value = "-274.0", inclusive = true) @DecimalMax(value = "100.0", inclusive = true)
    private Double minTemperature;
    
    @NotNull @DecimalMin(value = "-274.0", inclusive = true) @DecimalMax(value = "100.0", inclusive = true)
    private Double maxTemperature;
    
    @NotNull @DecimalMin(value = "0", inclusive = true) @DecimalMax(value = "100", inclusive = true)
    private Double minHumidity;
    
    @NotNull @DecimalMin(value = "0", inclusive = true) @DecimalMax(value = "100", inclusive = true)
    private Double maxHumidity;
    
    @NotNull @DecimalMin(value = "0", inclusive = true)
    private Double minWindSpeed;
    
    @NotNull @DecimalMin(value = "0", inclusive = true)
    private Double maxWindSpeed;

    @Column(updatable = false)
    private Instant createdAt;
    private Instant updatedAt;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private UserEntity user;

    @NotNull
    @Column(nullable = false)
    @DecimalMin(value = "0.1", inclusive = true) @DecimalMax(value = "10.0", inclusive = true)
    private Double weight = 1.0;

    @ManyToOne
    @JoinColumn(name = "id_default")
    private DefaultActivity defaultActivity;

    private Boolean isDefault = false;
    
    // Nuevo campo para rastrear si la actividad ha sido personalizada
    private Boolean wasCustomized = false;

    @ManyToMany
    @JoinTable(
        name = "activity_tags",
        joinColumns = @JoinColumn(name = "activity_id", referencedColumnName = "activity_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id", referencedColumnName = "id"))
    private List<Tag> tags = new ArrayList<>();

    @OneToMany(mappedBy = "activity")
    private List<Calendar> calendars = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}
