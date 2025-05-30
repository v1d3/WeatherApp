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
                if (defaultActivity.getTags() != null) {
                    activity.setTags(new ArrayList<>(defaultActivity.getTags()));
                } else {
                    activity.setTags(new ArrayList<>());
                }
                
                activityRepository.save(activity);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
