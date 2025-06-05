package com.team13.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;

import com.team13.backend.model.DefaultActivityListener;

@Configuration
public class JpaListenerConfig implements ApplicationContextAware {

    private static ApplicationContext applicationContext;
    
    @Override
    public void setApplicationContext(ApplicationContext appContext) {
        applicationContext = appContext;
    }
    
    public static ApplicationContext getApplicationContext() {
        return applicationContext;
    }
    
    @Bean
    public DefaultActivityListener defaultActivityListener() {
        return new DefaultActivityListener();
    }
}
