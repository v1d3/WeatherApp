package com.team13.backend.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.coyote.BadRequestException;
import org.hibernate.Hibernate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.team13.backend.dto.ActivityCreationDTO;
import com.team13.backend.dto.ActivityResponseDTO;
import com.team13.backend.dto.WeatherResponseDTO;
import com.team13.backend.model.Activity;
import com.team13.backend.model.UserEntity;
import com.team13.backend.model.Weather;
import com.team13.backend.repository.ActivityRepository;
import com.team13.backend.repository.UserEntityRepository;
import com.team13.backend.repository.WeatherRepository;

import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;

@Service
public class ActivityService {
    private final ActivityRepository activityRepository;
    private final WeatherRepository weatherRepository;
    private final UserEntityRepository userEntityRepository; // Add this repository

    public ActivityService(ActivityRepository activityRepository,
            WeatherRepository weatherRepository,
            UserEntityRepository userEntityRepository) {
        this.activityRepository = activityRepository;
        this.weatherRepository = weatherRepository;
        this.userEntityRepository = userEntityRepository;
    }

    public List<Activity> getAllActivities() {
        return activityRepository.findAll();
    }

    public List<ActivityResponseDTO> searchActivities(String weatherName, Double temperature, Double humidity,
            Double windSpeed) {
        return activityRepository.findAll((root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            root.fetch("weathers", JoinType.LEFT);
            query.distinct(true);

            if (weatherName != null) {
                predicates.add(criteriaBuilder.equal(root.join("weathers").get("name"), weatherName));
            }

            if (temperature != null) {
                predicates.add(criteriaBuilder.and(
                        criteriaBuilder.lessThanOrEqualTo(root.get("minTemperature"), temperature),
                        criteriaBuilder.greaterThanOrEqualTo(root.get("maxTemperature"), temperature)));
            }
            if (humidity != null) {
                predicates.add(criteriaBuilder.and(
                        criteriaBuilder.lessThanOrEqualTo(root.get("minHumidity"), humidity),
                        criteriaBuilder.greaterThanOrEqualTo(root.get("maxHumidity"), humidity)));
            }
            if (windSpeed != null) {
                predicates.add(criteriaBuilder.and(
                        criteriaBuilder.lessThanOrEqualTo(root.get("minWindSpeed"), windSpeed),
                        criteriaBuilder.greaterThanOrEqualTo(root.get("maxWindSpeed"), windSpeed)));
            }
            if (predicates.isEmpty()) {
                return criteriaBuilder.conjunction(); // No filters applied, return all activities
            }
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        }).stream()
                .map(activity -> {
                    List<WeatherResponseDTO> weathers = activity.getWeathers().stream()
                            .map(weather -> new WeatherResponseDTO(weather.getId(), weather.getName())) // Assuming you
                                                                                                        // have a way to
                                                                                                        // get weather
                                                                                                        // name
                            .toList();
                    return new ActivityResponseDTO(activity.getId(), activity.getName(), weathers,
                            activity.getMinTemperature(), activity.getMaxTemperature(), activity.getMinHumidity(),
                            activity.getMaxHumidity(), activity.getMinWindSpeed(), activity.getMaxWindSpeed());
                })
                .toList();
    }

    public Activity createActivity(ActivityCreationDTO activityCreationDTO) throws BadRequestException {
        // Get the currently authenticated user
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = userEntityRepository.findByUsername(username)
                .orElseThrow(() -> new BadRequestException("User not found"));

        // Check if this user already has an activity with this name
        if (activityRepository.existsByNameAndUserId(activityCreationDTO.getName(), user.getId())) {
            throw new BadRequestException("You already have an activity with this name.");
        }

        List<Weather> weathers = weatherRepository.findAllById(activityCreationDTO.getWeatherIds());
        if (weathers.isEmpty() || weathers.size() != activityCreationDTO.getWeatherIds().size()) {
            throw new BadRequestException("Some weather IDs are invalid.");
        }

        Activity activity = new Activity();
        activity.setName(activityCreationDTO.getName());
        activity.setWeathers(weathers);
        activity.setMinTemperature(activityCreationDTO.getMinTemperature());
        activity.setMaxTemperature(activityCreationDTO.getMaxTemperature());
        activity.setMinHumidity(activityCreationDTO.getMinHumidity());
        activity.setMaxHumidity(activityCreationDTO.getMaxHumidity());
        activity.setMinWindSpeed(activityCreationDTO.getMinWindSpeed());
        activity.setMaxWindSpeed(activityCreationDTO.getMaxWindSpeed());
        activity.setUser(user);

        return activityRepository.save(activity);
    }

    // Método para agregar al ActivityService
    public Map<Long, Double> getActivityWeightsForUser(String userId) {
        // Buscar al usuario por su ID (o nombre de usuario)
        UserEntity user = userEntityRepository.findByUsername(userId)
                .orElse(null);

        Map<Long, Double> weights = new HashMap<>();

        if (user != null) {
            // Obtener todas las actividades del usuario
            List<Activity> userActivities = activityRepository.findByUser(user);

            // Extraer el peso de cada actividad
            for (Activity activity : userActivities) {
                // Convertir de Integer a Double para compatibilidad con el algoritmo softmax
                weights.put(activity.getId(), activity.getWeight().doubleValue());
            }
        }

        return weights;
    }

    @Transactional
    public List<ActivityResponseDTO> searchActivitiesByUser(String username) {
        // Buscar al usuario por su nombre de usuario
        UserEntity user = userEntityRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Obtener solo las actividades de este usuario
        List<Activity> activities = activityRepository.findByUser(user);

        // Convertir a DTOs
        return activities.stream()
                .map(activity -> {
                    List<WeatherResponseDTO> weatherResponses = activity.getWeathers().stream()
                            .map(weather -> new WeatherResponseDTO(
                                    weather.getId(),
                                    weather.getName()))
                            .collect(java.util.stream.Collectors.toList());

                    return new ActivityResponseDTO(
                            activity.getId(),
                            activity.getName(),
                            weatherResponses,
                            activity.getMinTemperature(),
                            activity.getMaxTemperature(),
                            activity.getMinHumidity(),
                            activity.getMaxHumidity(),
                            activity.getMinWindSpeed(),
                            activity.getMaxWindSpeed());
                })
                .collect(java.util.stream.Collectors.toList());
    }
}
