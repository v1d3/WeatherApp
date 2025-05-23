package com.team13.backend.repository;

import com.team13.backend.model.DefaultActivity;
import com.team13.backend.model.UserEntity;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DefaultActivityRepository extends JpaRepository<DefaultActivity, Long> {
    List<DefaultActivity> findByUser(UserEntity user);
}
