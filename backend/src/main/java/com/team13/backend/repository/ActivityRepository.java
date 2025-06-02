package com.team13.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.team13.backend.model.Activity;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long>, JpaSpecificationExecutor<Activity> {
    Optional<Activity> findByName(String name);
    List<Activity> findByWeathersName(String weatherName);
    boolean existsByName(String name);
    
    // Add this method to check for duplicates by name and user
    boolean existsByNameAndUserId(String name, Long userId);
    
    // eliminar actividades relacionadas con una actividad predeterminada
    void deleteAllByDefaultActivityId(Long defaultActivityId);
}
