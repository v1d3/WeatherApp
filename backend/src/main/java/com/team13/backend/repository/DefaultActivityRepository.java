package com.team13.backend.repository;

import com.team13.backend.model.DefaultActivity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DefaultActivityRepository extends JpaRepository<DefaultActivity, Long> {
}
