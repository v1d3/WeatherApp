package com.team13.backend.service;

import com.team13.backend.model.DefaultActivity;
import com.team13.backend.repository.DefaultActivityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DefaultActivityService {

    @Autowired
    private DefaultActivityRepository defaultActivityRepository;

    public List<DefaultActivity> getAllDefaultActivities() {
        return defaultActivityRepository.findAll();
    }

    public Optional<DefaultActivity> getDefaultActivityById(Long id) {
        return defaultActivityRepository.findById(id);
    }

    public DefaultActivity saveDefaultActivity(DefaultActivity defaultActivity) {
        return defaultActivityRepository.save(defaultActivity);
    }

    public void deleteDefaultActivity(Long id) {
        defaultActivityRepository.deleteById(id);
    }
}
