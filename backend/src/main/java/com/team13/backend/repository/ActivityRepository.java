package com.team13.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.team13.backend.model.Activity;
import com.team13.backend.model.DefaultActivity;
import com.team13.backend.model.UserEntity;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long>, JpaSpecificationExecutor<Activity> {
    Optional<Activity> findByName(String name);
    List<Activity> findByWeathersName(String weatherName);
    boolean existsByName(String name);
    boolean existsByNameAndUserId(String name, Long userId);
    void deleteAllByDefaultActivityId(Long defaultActivityId);
    
    // Añadir este método para obtener actividades por usuario
    List<Activity> findByUser(UserEntity user);
    
    // Find activities by user and default activity ID
    List<Activity> findByUserAndDefaultActivityId(UserEntity user, Long defaultActivityId);
    List<Activity> findByDefaultActivity(DefaultActivity defaultActivity);
}

