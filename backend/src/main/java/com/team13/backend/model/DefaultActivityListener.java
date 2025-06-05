package com.team13.backend.model;

import com.team13.backend.repository.ActivityRepository;
import com.team13.backend.repository.UserEntityRepository;

import jakarta.persistence.PostPersist;
import jakarta.persistence.PostUpdate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.ArrayList;
import java.util.List;

@Component
public class DefaultActivityListener {
    
    private static ApplicationContext context;
    
    @Autowired
    public void setApplicationContext(ApplicationContext applicationContext) {
        context = applicationContext;
    }
    
    @PostPersist
    @PostUpdate
    public void onPostPersistOrUpdate(DefaultActivity defaultActivity) {
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                createActivitiesForUsers(defaultActivity);
            }
        });
    }
    
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void createActivitiesForUsers(DefaultActivity defaultActivity) {
        try {
            UserEntityRepository userRepository = context.getBean(UserEntityRepository.class);
            ActivityRepository activityRepository = context.getBean(ActivityRepository.class);
            
            for (UserEntity user : userRepository.findAll()) {
                // Verificar si ya existe una actividad para este usuario y esta actividad default
                List<Activity> existingActivities = activityRepository.findByUserAndDefaultActivityId(user, defaultActivity.getId());
                
                // Si existe y no ha sido personalizada, actualizar los valores
                if (!existingActivities.isEmpty() && !existingActivities.get(0).getWasCustomized()) {
                    Activity existingActivity = existingActivities.get(0);
                    existingActivity.setName(defaultActivity.getName());
                    existingActivity.setWeathers(new ArrayList<>(defaultActivity.getWeathers()));
                    existingActivity.setMinTemperature(defaultActivity.getMinTemperature());
                    existingActivity.setMaxTemperature(defaultActivity.getMaxTemperature());
                    existingActivity.setMinHumidity(defaultActivity.getMinHumidity());
                    existingActivity.setMaxHumidity(defaultActivity.getMaxHumidity());
                    existingActivity.setMinWindSpeed(defaultActivity.getMinWindSpeed());
                    existingActivity.setMaxWindSpeed(defaultActivity.getMaxWindSpeed());
                    if (defaultActivity.getTags() != null) {
                        existingActivity.setTags(new ArrayList<>(defaultActivity.getTags()));
                    } else {
                        existingActivity.setTags(new ArrayList<>());
                    }
                    activityRepository.save(existingActivity);
                }
                // Si no existe, crear una nueva actividad
                else if (existingActivities.isEmpty()) {
                    Activity activity = new Activity();
                    activity.setName(defaultActivity.getName());
                    activity.setWeathers(new ArrayList<>(defaultActivity.getWeathers()));
                    activity.setMinTemperature(defaultActivity.getMinTemperature());
                    activity.setMaxTemperature(defaultActivity.getMaxTemperature());
                    activity.setMinHumidity(defaultActivity.getMinHumidity());
                    activity.setMaxHumidity(defaultActivity.getMaxHumidity());
                    activity.setMinWindSpeed(defaultActivity.getMinWindSpeed());
                    activity.setMaxWindSpeed(defaultActivity.getMaxWindSpeed());
                    activity.setUser(user);
                    activity.setDefaultActivity(defaultActivity);
                    activity.setIsDefault(true);
                    activity.setWasCustomized(false);
                    if (defaultActivity.getTags() != null) {
                        activity.setTags(new ArrayList<>(defaultActivity.getTags()));
                    } else {
                        activity.setTags(new ArrayList<>());
                    }
                    
                    activityRepository.save(activity);
                }
                // Si existe pero fue personalizada, no la modificamos
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
