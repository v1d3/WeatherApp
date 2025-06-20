package com.team13.backend.model;

import com.team13.backend.service.DefaultActivityService;

import jakarta.persistence.PostUpdate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

import java.util.logging.Logger;

@Component
public class DefaultActivityListener {
    
    private static ApplicationContext context;
    private static final Logger logger = Logger.getLogger(DefaultActivityListener.class.getName());
    
    @Autowired
    public void setApplicationContext(ApplicationContext applicationContext) {
        context = applicationContext;
    }
    
    @PostUpdate
    public void onPostUpdate(DefaultActivity defaultActivity) {
        logger.info("DefaultActivity updated with ID: " + defaultActivity.getId());
        
        if (context != null && defaultActivity.getId() != null) {
            try {
                DefaultActivityService defaultActivityService = context.getBean(DefaultActivityService.class);
                defaultActivityService.createActivitiesForAllUsers(defaultActivity);
            } catch (Exception e) {
                logger.severe("Error updating activities for users: " + e.getMessage());
            }
        } else {
            logger.warning("ApplicationContext is null or DefaultActivity ID is null");
        }
    }
}
