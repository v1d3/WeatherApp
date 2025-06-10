package com.team13.backend.config;

import com.team13.backend.model.DefaultActivity;
import com.team13.backend.model.UserEntity;
import com.team13.backend.model.Activity;
import com.team13.backend.repository.DefaultActivityRepository;
import com.team13.backend.repository.UserEntityRepository;
import com.team13.backend.repository.ActivityRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.logging.Logger;

@Component
public class ActivityInitializer implements CommandLineRunner {

    private static final Logger logger = Logger.getLogger(ActivityInitializer.class.getName());

    @Autowired
    private DefaultActivityRepository defaultActivityRepository;

    @Autowired
    private UserEntityRepository userEntityRepository;

    @Autowired
    private ActivityRepository activityRepository;

    @Override
    @Transactional
    public void run(String... args) {
        logger.info("Verificando actividades predeterminadas para todos los usuarios...");

        // Obtener todas las actividades predeterminadas
        List<DefaultActivity> defaultActivities = defaultActivityRepository.findAll();
        logger.info("Encontradas " + defaultActivities.size() + " actividades predeterminadas");

        // Obtener todos los usuarios
        List<UserEntity> users = userEntityRepository.findAll();
        logger.info("Encontrados " + users.size() + " usuarios");

        // Para cada usuario y actividad predeterminada, verificar si ya existe la
        // relación
        int createdCount = 0;
        for (UserEntity user : users) {
            for (DefaultActivity defaultActivity : defaultActivities) {
                List<Activity> existingActivities = activityRepository.findByUserAndDefaultActivityId(
                        user, defaultActivity.getId());

                // Si no existe, crear una nueva actividad basada en la predeterminada
                if (existingActivities.isEmpty()) {
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
                    activity.setWeight(1.0); // Peso predeterminado

                    // Agregar tags si están presentes en la actividad predeterminada
                    if (defaultActivity.getTags() != null) {
                        activity.setTags(new ArrayList<>(defaultActivity.getTags()));
                    } else {
                        activity.setTags(new ArrayList<>());
                    }

                    activityRepository.save(activity);
                    createdCount++;
                }
            }
        }

        logger.info("Proceso completado. Se crearon " + createdCount + " nuevas actividades personalizadas.");
    }
}