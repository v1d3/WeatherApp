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

import org.apache.coyote.BadRequestException;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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
}
