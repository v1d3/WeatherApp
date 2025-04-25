package com.team13.backend.service;

import java.util.List;

import org.apache.coyote.BadRequestException;
import org.springframework.stereotype.Service;

import com.team13.backend.dto.ActivityCreationDTO;
import com.team13.backend.model.Activity;
import com.team13.backend.model.Weather;
import com.team13.backend.repository.ActivityRepository;
import com.team13.backend.repository.WeatherRepository;

@Service
public class ActivityService {
    private final ActivityRepository activityRepository;
    private final WeatherRepository weatherRepository;

    public ActivityService(ActivityRepository activityRepository, WeatherRepository weatherRepository) {
        this.activityRepository = activityRepository;
        this.weatherRepository = weatherRepository;
    }

    public List<Activity> getAllActivities() {
        return activityRepository.findAll();
    }

    public List<Activity> getActivitiesByWeatherName(String weatherName){
        if(weatherName == null){
            return activityRepository.findAll();
        }
        return activityRepository.findByWeathersName(weatherName);
    }

    public Activity createActivity(ActivityCreationDTO activityCreationDTO) throws BadRequestException {
        if(activityRepository.existsByName(activityCreationDTO.getName())){
            throw new BadRequestException("Activity already exists.");
        }   
        List<Weather> weathers = weatherRepository.findAllById(activityCreationDTO.getWeatherIds());
        if (weathers.isEmpty() || weathers.size() != activityCreationDTO.getWeatherIds().size()) {
            throw new BadRequestException("Some weather IDs are invalid.");
        }

        Activity activity = new Activity();
        activity.setName(activityCreationDTO.getName());
        activity.setWeathers(weathers);
        return activityRepository.save(activity);
    }
}
