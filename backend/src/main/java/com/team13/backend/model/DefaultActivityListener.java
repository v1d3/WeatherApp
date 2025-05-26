package com.team13.backend.model;

import com.team13.backend.config.JpaListenerConfig;
import com.team13.backend.repository.ActivityRepository;
import com.team13.backend.repository.UserEntityRepository;

import jakarta.persistence.PostPersist;
import jakarta.persistence.PostUpdate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

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
        ActivityRepository activityRepository = JpaListenerConfig.getApplicationContext().getBean(ActivityRepository.class);
        UserEntityRepository userRepository = JpaListenerConfig.getApplicationContext().getBean(UserEntityRepository.class);
        
        // Crea una actividad por cada usuario en el sistema
        userRepository.findAll().forEach(user -> {
            Activity activity = new Activity();
            activity.setName(defaultActivity.getName());
            activity.setWeathers(defaultActivity.getWeathers());
            activity.setMinTemperature(defaultActivity.getMinTemperature());
            activity.setMaxTemperature(defaultActivity.getMaxTemperature());
            activity.setMinHumidity(defaultActivity.getMinHumidity());
            activity.setMaxHumidity(defaultActivity.getMaxHumidity());
            activity.setMinWindSpeed(defaultActivity.getMinWindSpeed());
            activity.setMaxWindSpeed(defaultActivity.getMaxWindSpeed());
            activity.setUser(user);
            activity.setDefaultActivity(defaultActivity);
            activity.setIsDefault(true);
            activity.setTags(defaultActivity.getTags());
            
            activityRepository.save(activity);
        });
    }
}
