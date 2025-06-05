package com.team13.backend.service;

import com.team13.backend.dto.ActivityModificationDTO;
import com.team13.backend.dto.ActivityResponseDTO;
import com.team13.backend.dto.WeatherResponseDTO;
import com.team13.backend.model.Activity;
import com.team13.backend.model.DefaultActivity;
import com.team13.backend.model.UserEntity;
import com.team13.backend.model.Weather;
import com.team13.backend.model.Tag;
import com.team13.backend.repository.ActivityRepository;
import com.team13.backend.repository.DefaultActivityRepository;
import com.team13.backend.repository.UserEntityRepository;
import com.team13.backend.repository.WeatherRepository;
import com.team13.backend.repository.TagRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserActivityService {

    private final ActivityRepository activityRepository;
    private final DefaultActivityRepository defaultActivityRepository;
    private final UserEntityRepository userEntityRepository;
    private final WeatherRepository weatherRepository;
    private final TagRepository tagRepository;

    public UserActivityService(ActivityRepository activityRepository,
                             DefaultActivityRepository defaultActivityRepository,
                             UserEntityRepository userEntityRepository,
                             WeatherRepository weatherRepository,
                             TagRepository tagRepository) {
        this.activityRepository = activityRepository;
        this.defaultActivityRepository = defaultActivityRepository;
        this.userEntityRepository = userEntityRepository;
        this.weatherRepository = weatherRepository;
        this.tagRepository = tagRepository;
    }

    @Transactional
    public ActivityResponseDTO customizeDefaultActivity(String username, Long defaultActivityId, 
                                                     ActivityModificationDTO modificationDTO) {
        // Find the user
        UserEntity user = userEntityRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Find the default activity
        DefaultActivity defaultActivity = defaultActivityRepository.findById(defaultActivityId)
            .orElseThrow(() -> new RuntimeException("Default activity not found"));

        // Check if user already has a custom version of this default activity
        Activity existingCustomActivity = activityRepository.findAll().stream()
            .filter(a -> a.getUser().getId().equals(user.getId()) && 
                   a.getDefaultActivity() != null && 
                   a.getDefaultActivity().getId().equals(defaultActivityId))
            .findFirst()
            .orElse(null);

        Activity customActivity;
        if (existingCustomActivity != null) {
            // Update existing custom activity
            customActivity = updateExistingCustomActivity(existingCustomActivity, modificationDTO);
        } else {
            // Create new custom activity based on default
            customActivity = createNewCustomActivity(user, defaultActivity, modificationDTO);
        }

        // Save the activity
        Activity savedActivity = activityRepository.save(customActivity);

        // Convert to DTO and return
        return convertToResponseDTO(savedActivity);
    }

    private Activity updateExistingCustomActivity(Activity existingActivity, 
                                               ActivityModificationDTO modificationDTO) {
        // Update only fields that are provided in the modificationDTO
        if (modificationDTO.name() != null) {
            existingActivity.setName(modificationDTO.name());
        }

        if (modificationDTO.weatherIds() != null) {
            List<Weather> weathers = weatherRepository.findAllById(modificationDTO.weatherIds());
            existingActivity.setWeathers(weathers);
        }

        if (modificationDTO.minTemperature() != null) {
            existingActivity.setMinTemperature(modificationDTO.minTemperature());
        }

        if (modificationDTO.maxTemperature() != null) {
            existingActivity.setMaxTemperature(modificationDTO.maxTemperature());
        }

        if (modificationDTO.minHumidity() != null) {
            existingActivity.setMinHumidity(modificationDTO.minHumidity());
        }

        if (modificationDTO.maxHumidity() != null) {
            existingActivity.setMaxHumidity(modificationDTO.maxHumidity());
        }

        if (modificationDTO.minWindSpeed() != null) {
            existingActivity.setMinWindSpeed(modificationDTO.minWindSpeed());
        }

        if (modificationDTO.maxWindSpeed() != null) {
            existingActivity.setMaxWindSpeed(modificationDTO.maxWindSpeed());
        }

        if (modificationDTO.tagIds() != null) {
            List<Tag> tags = tagRepository.findAllById(modificationDTO.tagIds());
            existingActivity.setTags(tags);
        }

        if (modificationDTO.weight() != null) {
            existingActivity.setWeight(modificationDTO.weight().doubleValue());
        }
        
        // This is now a custom activity, not the default one
        existingActivity.setIsDefault(false);

        return existingActivity;
    }

    private Activity createNewCustomActivity(UserEntity user, DefaultActivity defaultActivity, 
                                          ActivityModificationDTO modificationDTO) {
        Activity newActivity = new Activity();
        
        // Set default activity reference
        newActivity.setDefaultActivity(defaultActivity);
        newActivity.setUser(user);
        
        // Start with values from default activity
        newActivity.setName(modificationDTO.name() != null ? 
            modificationDTO.name() : defaultActivity.getName());
            
        // Set weathers - either from DTO or from default activity
        if (modificationDTO.weatherIds() != null) {
            List<Weather> weathers = weatherRepository.findAllById(modificationDTO.weatherIds());
            newActivity.setWeathers(weathers);
        } else {
            newActivity.setWeathers(new ArrayList<>(defaultActivity.getWeathers()));
        }
        
        // Set temperature limits
        newActivity.setMinTemperature(modificationDTO.minTemperature() != null ? 
            modificationDTO.minTemperature() : defaultActivity.getMinTemperature());
        newActivity.setMaxTemperature(modificationDTO.maxTemperature() != null ? 
            modificationDTO.maxTemperature() : defaultActivity.getMaxTemperature());
        
        // Set humidity limits
        newActivity.setMinHumidity(modificationDTO.minHumidity() != null ? 
            modificationDTO.minHumidity() : defaultActivity.getMinHumidity());
        newActivity.setMaxHumidity(modificationDTO.maxHumidity() != null ? 
            modificationDTO.maxHumidity() : defaultActivity.getMaxHumidity());
        
        // Set wind speed limits
        newActivity.setMinWindSpeed(modificationDTO.minWindSpeed() != null ? 
            modificationDTO.minWindSpeed() : defaultActivity.getMinWindSpeed());
        newActivity.setMaxWindSpeed(modificationDTO.maxWindSpeed() != null ? 
            modificationDTO.maxWindSpeed() : defaultActivity.getMaxWindSpeed());
        
        // Set tags - either from DTO or from default activity
        if (modificationDTO.tagIds() != null) {
            List<Tag> tags = tagRepository.findAllById(modificationDTO.tagIds());
            newActivity.setTags(tags);
        } else if (defaultActivity.getTags() != null) {
            newActivity.setTags(new ArrayList<>(defaultActivity.getTags()));
        }
        
        // Set weight
        newActivity.setWeight(modificationDTO.weight() != null ? 
            modificationDTO.weight() : 1.0);
        
        // Mark as not default (custom)
        newActivity.setIsDefault(false);
        
        return newActivity;
    }
    
    private ActivityResponseDTO convertToResponseDTO(Activity activity) {
        List<WeatherResponseDTO> weatherResponses = activity.getWeathers().stream()
            .map(weather -> new WeatherResponseDTO(
                weather.getId(),
                weather.getName()))
            .collect(Collectors.toList());
        

        return new ActivityResponseDTO(
            activity.getId(),
            activity.getName(),
            weatherResponses,
            activity.getMinTemperature(),
            activity.getMaxTemperature(),
            activity.getMinHumidity(),
            activity.getMaxHumidity(),
            activity.getMinWindSpeed(),
            activity.getMaxWindSpeed(),
            activity.getDefaultActivity() != null ? activity.getDefaultActivity().getId() : null,
            activity.getIsDefault() != null ? !activity.getIsDefault() : false
        );
    }
}