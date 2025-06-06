package com.team13.backend.model;

import java.time.Instant;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter

public class Calendar {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long calendar_id;
    public Long getId() {
        return calendar_id;
    }
    public void setId(Long id) {
        calendar_id = id;
    }
    
    @NotNull
    private Long timeInit;
    @PrePersist
    public void ensureTimeInit() {
        Long aux = timeInit - Instant.now().toEpochMilli();
        if (timeInit == null) {
            throw new IllegalArgumentException("timeInit must be not null.");
        }
        else if (aux <= 0) {
            throw new IllegalArgumentException("timeInit must be set to a future time. Current time: " + Instant.now().toEpochMilli() + " - Time Inserted: " + timeInit);
        }
    }

    @NotNull
    @ManyToOne
    @JoinColumn(name = "user_id")
    private UserEntity userEntity;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "activity_id")
    private Activity activity;
}
