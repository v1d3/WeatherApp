package com.team13.backend.service;

import com.team13.backend.dto.activity.DActivityCreationDTO;
import com.team13.backend.dto.activity.DActivityResponseDTO;
import com.team13.backend.model.Activity;
import com.team13.backend.model.DefaultActivity;
import com.team13.backend.model.Tag;
import com.team13.backend.model.Weather;
import com.team13.backend.repository.ActivityRepository;
import com.team13.backend.repository.DefaultActivityRepository;
import com.team13.backend.repository.TagRepository;
import com.team13.backend.repository.WeatherRepository;
import com.team13.backend.model.UserEntity;
import com.team13.backend.repository.UserEntityRepository;

import org.apache.coyote.BadRequestException;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.logging.Logger;

@Service
public class DefaultActivityService {

    @Autowired
    private DefaultActivityRepository defaultActivityRepository;
    @Autowired
    private WeatherRepository weatherRepository;
    @Autowired
    private TagRepository tagRepository;
    @Autowired
    private WeatherService weatherService;
    @Autowired
    private ActivityRepository activityRepository;
    @Autowired
    private TagService tagService;
    @Autowired
    private UserEntityRepository userEntityRepository;

    public DActivityResponseDTO createDefaultActivity(DActivityCreationDTO dActivity) throws BadRequestException {
        DefaultActivity defaultActivity = new DefaultActivity();
        defaultActivity.setName(dActivity.getName());
        defaultActivity.setMinTemperature(dActivity.getMinTemperature());
        defaultActivity.setMaxTemperature(dActivity.getMaxTemperature());
        defaultActivity.setMinHumidity(dActivity.getMinHumidity());
        defaultActivity.setMaxHumidity(dActivity.getMaxHumidity());
        defaultActivity.setMinWindSpeed(dActivity.getMinWindSpeed());
        defaultActivity.setMaxWindSpeed(dActivity.getMaxWindSpeed());
        List<Weather> weathers = weatherRepository.findAllById(dActivity.getWeatherIds());
        if (weathers.size() != dActivity.getWeatherIds().size()) {
            throw new BadRequestException("Invalid weather IDs provided.");
        }
        defaultActivity.setWeathers(weathers);
        List<Tag> tags = tagRepository.findAllById(dActivity.getTagIds());
        if (tags.size() != dActivity.getTagIds().size()) {
            throw new BadRequestException("Invalid tag IDs provided.");
        }
        defaultActivity.setTags(tags);
        DefaultActivity savedActivity = defaultActivityRepository.save(defaultActivity);
        return dActivityToDto(savedActivity);
    }

    public DActivityResponseDTO dActivityToDto(DefaultActivity dActivity) {
        Hibernate.initialize(dActivity.getWeathers());
        Hibernate.initialize(dActivity.getTags());
        return new DActivityResponseDTO(
                dActivity.getId(),
                dActivity.getName(),
                dActivity.getMinTemperature(),
                dActivity.getMaxTemperature(),
                dActivity.getMinHumidity(),
                dActivity.getMaxHumidity(),
                dActivity.getMinWindSpeed(),
                dActivity.getMaxWindSpeed(),
                dActivity.getWeathers().stream()
                        .map(weather -> weatherService.weatherToDto(weather))
                        .toList(),
                dActivity.getTags().stream()
                        .map(tag -> tagService.tagToDto(tag))
                        .toList());
    }

    public DefaultActivity getDefaultActivityModelById(Long id){
        DefaultActivity defaultActivity = defaultActivityRepository.findById(id).orElseThrow(() -> new RuntimeException("Default activity not found"));
        return defaultActivity;
    }

    public DActivityResponseDTO getDefaultActivityById(Long id) {
        DefaultActivity defaultActivity = defaultActivityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Default activity not found"));
        return dActivityToDto(defaultActivity);
    }

    public DActivityResponseDTO updateDefaultActivity(Long id, DActivityCreationDTO activityCreationDTO) {
        DefaultActivity defaultActivity = defaultActivityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Default activity not found"));

        defaultActivity.setName(activityCreationDTO.getName());
        defaultActivity.setMinTemperature(activityCreationDTO.getMinTemperature());
        defaultActivity.setMaxTemperature(activityCreationDTO.getMaxTemperature());
        defaultActivity.setMinHumidity(activityCreationDTO.getMinHumidity());
        defaultActivity.setMaxHumidity(activityCreationDTO.getMaxHumidity());
        defaultActivity.setMinWindSpeed(activityCreationDTO.getMinWindSpeed());
        defaultActivity.setMaxWindSpeed(activityCreationDTO.getMaxWindSpeed());

        List<Weather> weathers = weatherRepository.findAllById(activityCreationDTO.getWeatherIds());
        if (weathers.size() != activityCreationDTO.getWeatherIds().size()) {
            throw new RuntimeException("Invalid weather IDs provided.");
        }
        defaultActivity.setWeathers(weathers);

        List<Tag> tags = tagRepository.findAllById(activityCreationDTO.getTagIds());
        if (tags.size() != activityCreationDTO.getTagIds().size()) {
            throw new RuntimeException("Invalid tag IDs provided.");
        }
        defaultActivity.setTags(tags);

        DefaultActivity updatedActivity = defaultActivityRepository.save(defaultActivity);
        return dActivityToDto(updatedActivity);
    }

    public boolean deleteDefaultActivity(Long id) {
        DefaultActivity defaultActivity = defaultActivityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Default activity not found"));

        // If default activity is referenced by any user activities, delete the fk on the user activities
        List<Activity> userActivities = activityRepository.findByDefaultActivity(defaultActivity);
        for (Activity userActivity : userActivities) {
            userActivity.setDefaultActivity(null);
            userActivity.setWasCustomized(false);
            activityRepository.save(userActivity);
        }
        defaultActivityRepository.delete(defaultActivity);
        return true;
    }
    
    @Transactional
    public List<DActivityResponseDTO> getDefaultActivitiesAsDTO() {
        List<DefaultActivity> defaultActivities = defaultActivityRepository.findAll();
        return defaultActivities.stream().map(this::dActivityToDto).toList();
    }

    // OLD STUFF
    public List<DefaultActivity> getAllDefaultActivities() {
        return defaultActivityRepository.findAll();
    }
    
    @Transactional
    public void createActivitiesForAllUsers(DefaultActivity defaultActivity) {
        // Verificar que el DefaultActivity exista en la base de datos
        DefaultActivity reloadedActivity = defaultActivityRepository.findById(defaultActivity.getId())
            .orElseThrow(() -> new IllegalArgumentException("No existe DefaultActivity con ID: " + defaultActivity.getId()));
        
        // Inicializar colecciones
        Hibernate.initialize(reloadedActivity.getWeathers());
        Hibernate.initialize(reloadedActivity.getTags());
        
        // Obtener todos los usuarios
        List<UserEntity> users = userEntityRepository.findAll();
        
        // Por cada usuario, verificar si ya tiene una actividad asociada a esta default
        for (UserEntity user : users) {
            try {
                // Verificar si ya existe una actividad para este usuario y esta actividad default
                List<Activity> existingActivities = activityRepository.findByUserAndDefaultActivityId(user, reloadedActivity.getId());
                
                // Solo crear actividad si no existe
                if (existingActivities.isEmpty()) {
                    Activity activity = new Activity();
                    activity.setName(reloadedActivity.getName());
                    activity.setWeathers(new ArrayList<>(reloadedActivity.getWeathers()));
                    activity.setMinTemperature(reloadedActivity.getMinTemperature());
                    activity.setMaxTemperature(reloadedActivity.getMaxTemperature());
                    activity.setMinHumidity(reloadedActivity.getMinHumidity());
                    activity.setMaxHumidity(reloadedActivity.getMaxHumidity());
                    activity.setMinWindSpeed(reloadedActivity.getMinWindSpeed());
                    activity.setMaxWindSpeed(reloadedActivity.getMaxWindSpeed());
                    activity.setUser(user);
                    activity.setDefaultActivity(reloadedActivity);
                    activity.setIsDefault(true);
                    activity.setWasCustomized(false);
                    activity.setWeight(1.0);
                    
                    // Agregar tags si están presentes
                    if (reloadedActivity.getTags() != null) {
                        activity.setTags(new ArrayList<>(reloadedActivity.getTags()));
                    } else {
                        activity.setTags(new ArrayList<>());
                    }
                    
                    activityRepository.save(activity);
                }
                // No intentamos actualizar actividades existentes
            } catch (Exception e) {
                Logger.getLogger(DefaultActivityService.class.getName())
                    .warning("Error al crear actividad para usuario " + user.getUsername() + ": " + e.getMessage());
            }
        }
    }

    // Método auxiliar para crear una nueva actividad
    private void createNewActivityForUser(UserEntity user, DefaultActivity defaultActivity) {
        Activity activity = new Activity();
        activity.setName(defaultActivity.getName());
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
        activity.setWeight(1.0);
        
        // Obtener copias frescas de las relaciones
        List<Long> weatherIds = defaultActivity.getWeathers().stream()
            .map(Weather::getId)
            .toList();
        List<Weather> weathers = weatherRepository.findAllById(weatherIds);
        activity.setWeathers(new ArrayList<>(weathers));
        
        if (defaultActivity.getTags() != null && !defaultActivity.getTags().isEmpty()) {
            List<Long> tagIds = defaultActivity.getTags().stream()
                .map(Tag::getId)
                .toList();
            List<Tag> tags = tagRepository.findAllById(tagIds);
            activity.setTags(new ArrayList<>(tags));
        } else {
            activity.setTags(new ArrayList<>());
        }
        
        activityRepository.save(activity);
    }

    // Método auxiliar para actualizar una actividad existente
    private void updateExistingActivity(Activity activity, DefaultActivity defaultActivity) {
        // Asegurarse de trabajar con una entidad gestionada
        Activity managedActivity = activityRepository.findById(activity.getId()).orElse(null);
        if (managedActivity == null) return;
        
        // Actualizar propiedades escalares
        managedActivity.setName(defaultActivity.getName());
        managedActivity.setMinTemperature(defaultActivity.getMinTemperature());
        managedActivity.setMaxTemperature(defaultActivity.getMaxTemperature());
        managedActivity.setMinHumidity(defaultActivity.getMinHumidity());
        managedActivity.setMaxHumidity(defaultActivity.getMaxHumidity());
        managedActivity.setMinWindSpeed(defaultActivity.getMinWindSpeed());
        managedActivity.setMaxWindSpeed(defaultActivity.getMaxWindSpeed());
        
        // Obtener copias frescas de las relaciones
        List<Long> weatherIds = defaultActivity.getWeathers().stream()
            .map(Weather::getId)
            .toList();
        List<Weather> weathers = weatherRepository.findAllById(weatherIds);
        
        // Actualizar colecciones de forma segura
        managedActivity.getWeathers().clear();
        managedActivity.getWeathers().addAll(weathers);
        
        // Manejar tags con verificación de nulos
        if (defaultActivity.getTags() != null && !defaultActivity.getTags().isEmpty()) {
            List<Long> tagIds = defaultActivity.getTags().stream()
                .map(Tag::getId)
                .toList();
            List<Tag> tags = tagRepository.findAllById(tagIds);
            
            managedActivity.getTags().clear();
            managedActivity.getTags().addAll(tags);
        } else {
            managedActivity.getTags().clear();
        }
        
        activityRepository.save(managedActivity);
    }
}
