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
import com.team13.backend.model.DefaultActivity;
import com.team13.backend.model.UserEntity;
import com.team13.backend.model.Weather;
import com.team13.backend.repository.ActivityRepository;
import com.team13.backend.repository.UserEntityRepository;
import com.team13.backend.repository.WeatherRepository;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;

@Service
public class ActivityService {
    private final ActivityRepository activityRepository;
    private final WeatherRepository weatherRepository;
    private final UserEntityRepository userEntityRepository; // Add this repository
    private final DefaultActivityService defaultActivityService;

    public ActivityService(ActivityRepository activityRepository,
            WeatherRepository weatherRepository,
            UserEntityRepository userEntityRepository,
            DefaultActivityService defaultActivityService) {
        this.activityRepository = activityRepository;
        this.weatherRepository = weatherRepository;
        this.userEntityRepository = userEntityRepository;
        this.defaultActivityService = defaultActivityService;
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
                            .map(weather -> new WeatherResponseDTO(weather.getId(), weather.getName()))
                            .toList();
                    return new ActivityResponseDTO(
                            activity.getId(),
                            activity.getName(),
                            weathers,
                            activity.getMinTemperature(),
                            activity.getMaxTemperature(),
                            activity.getMinHumidity(),
                            activity.getMaxHumidity(),
                            activity.getMinWindSpeed(),
                            activity.getMaxWindSpeed(),
                            activity.getDefaultActivity() != null ? activity.getDefaultActivity().getId() : null,
                            activity.getWasCustomized() != null ? activity.getWasCustomized() : false);
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
                            activity.getMaxWindSpeed(),
                            activity.getDefaultActivity() != null ? activity.getDefaultActivity().getId() : null,
                            activity.getWasCustomized() != null ? activity.getWasCustomized() : false);
                })
                .collect(java.util.stream.Collectors.toList());
    }

    @Transactional
    public List<ActivityResponseDTO> searchActivitiesByUserAndFilters(String username,
            String weatherName, Double temperature, Double humidity, Double windSpeed) {

        // Buscar al usuario por su nombre de usuario
        UserEntity user = userEntityRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return activityRepository.findAll((root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Filtro por usuario (siempre aplicado)
            predicates.add(criteriaBuilder.equal(root.get("user"), user));

            // Agregar filtro por nombre de clima si está presente
            if (weatherName != null && !weatherName.isEmpty()) {
                Join<Activity, Weather> weatherJoin = root.join("weathers");
                predicates.add(criteriaBuilder.like(weatherJoin.get("name"), "%" + weatherName + "%"));
            }

            // Agregar filtro por temperatura si está presente
            if (temperature != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("minTemperature"), temperature));
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("maxTemperature"), temperature));
            }

            // Agregar filtro por humedad si está presente
            if (humidity != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("minHumidity"), humidity));
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("maxHumidity"), humidity));
            }

            // Agregar filtro por velocidad del viento si está presente
            if (windSpeed != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("minWindSpeed"), windSpeed));
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("maxWindSpeed"), windSpeed));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        })
                .stream()
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
                            activity.getMaxWindSpeed(),
                            activity.getDefaultActivity() != null ? activity.getDefaultActivity().getId() : null,
                            activity.getWasCustomized() != null ? activity.getWasCustomized() : false);
                })
                .collect(java.util.stream.Collectors.toList());
    }

    @Transactional
    public List<ActivityResponseDTO> getDefaultActivitiesAsDTO() {
        List<DefaultActivity> defaultActivities = defaultActivityService.getAllDefaultActivities();

        return defaultActivities.stream()
                .map(activity -> {
                    List<WeatherResponseDTO> weatherResponses = activity.getWeathers().stream()
                            .map(weather -> new WeatherResponseDTO(
                                    weather.getId(),
                                    weather.getName()))
                            .collect(java.util.stream.Collectors.toList());

                    return new ActivityResponseDTO(
                            // Use negative IDs for default activities to avoid conflicts with user
                            // activities
                            -activity.getId(),
                            activity.getName(),
                            weatherResponses,
                            activity.getMinTemperature(),
                            activity.getMaxTemperature(),
                            activity.getMinHumidity(),
                            activity.getMaxHumidity(),
                            activity.getMinWindSpeed(),
                            activity.getMaxWindSpeed(),
                            null, // Las actividades predeterminadas no tienen defaultActivityId
                            false); // Default activities are not customized by default
                })
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * Finds a user's customized version of a default activity
     * 
     * @param username          The username of the user
     * @param defaultActivityId The ID of the default activity
     * @return The customized activity if found, null otherwise
     */
    @Transactional(readOnly = true)
    public ActivityResponseDTO findCustomizedDefaultActivity(String username, Long defaultActivityId) {
        // Find the user
        UserEntity user = userEntityRepository.findByUsername(username)
                .orElse(null);

        if (user == null) {
            return null;
        }

        // Find activities that belong to this user and reference the given default
        // activity
        List<Activity> activities = activityRepository.findByUserAndDefaultActivityId(user, defaultActivityId);

        if (activities.isEmpty()) {
            return null;
        }

        // Convert to DTO and return the first match
        Activity activity = activities.get(0);
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
                activity.getMaxWindSpeed(),
                activity.getDefaultActivity() != null ? activity.getDefaultActivity().getId() : null,
                activity.getWasCustomized() != null ? activity.getWasCustomized() : false);
    }

    /**
     * Permite a un usuario personalizar una actividad predeterminada
     */
    @Transactional
    public ActivityResponseDTO customizeDefaultActivity(String username, Long defaultActivityId,
            ActivityCreationDTO customizationData) throws BadRequestException {

        // Buscar el usuario
        UserEntity user = userEntityRepository.findByUsername(username)
                .orElseThrow(() -> new BadRequestException("Usuario no encontrado"));

        // Buscar la actividad del usuario que corresponde a la actividad predeterminada
        List<Activity> activities = activityRepository.findByUserAndDefaultActivityId(user, defaultActivityId);

        if (activities.isEmpty()) {
            throw new BadRequestException("No se encontró la actividad predeterminada");
        }

        Activity activity = activities.get(0);

        // Actualizar los campos de la actividad con los datos personalizados
        if (customizationData.getName() != null) {
            activity.setName(customizationData.getName());
        }

        if (customizationData.getWeatherIds() != null && !customizationData.getWeatherIds().isEmpty()) {
            List<Weather> weathers = weatherRepository.findAllById(customizationData.getWeatherIds());
            if (weathers.size() != customizationData.getWeatherIds().size()) {
                throw new BadRequestException("Algunos IDs de clima no son válidos");
            }
            activity.setWeathers(weathers);
        }

        if (customizationData.getMinTemperature() != null) {
            activity.setMinTemperature(customizationData.getMinTemperature());
        }

        if (customizationData.getMaxTemperature() != null) {
            activity.setMaxTemperature(customizationData.getMaxTemperature());
        }

        if (customizationData.getMinHumidity() != null) {
            activity.setMinHumidity(customizationData.getMinHumidity());
        }

        if (customizationData.getMaxHumidity() != null) {
            activity.setMaxHumidity(customizationData.getMaxHumidity());
        }

        if (customizationData.getMinWindSpeed() != null) {
            activity.setMinWindSpeed(customizationData.getMinWindSpeed());
        }

        if (customizationData.getMaxWindSpeed() != null) {
            activity.setMaxWindSpeed(customizationData.getMaxWindSpeed());
        }

        // Marcar como personalizada
        activity.setWasCustomized(true);

        // Guardar los cambios
        Activity updatedActivity = activityRepository.save(activity);

        // Convertir a DTO y devolver
        List<WeatherResponseDTO> weatherResponses = updatedActivity.getWeathers().stream()
                .map(weather -> new WeatherResponseDTO(
                        weather.getId(),
                        weather.getName()))
                .collect(java.util.stream.Collectors.toList());

        return new ActivityResponseDTO(
                updatedActivity.getId(),
                updatedActivity.getName(),
                weatherResponses,
                updatedActivity.getMinTemperature(),
                updatedActivity.getMaxTemperature(),
                updatedActivity.getMinHumidity(),
                updatedActivity.getMaxHumidity(),
                updatedActivity.getMinWindSpeed(),
                updatedActivity.getMaxWindSpeed(),
                updatedActivity.getDefaultActivity() != null ? updatedActivity.getDefaultActivity().getId() : null,
                updatedActivity.getWasCustomized() != null ? updatedActivity.getWasCustomized() : true);
    }

    /**
     * Actualiza el peso (valoración) de una actividad para un usuario específico
     * 
     * @param username El nombre de usuario
     * @param activityId El ID de la actividad
     * @param newWeight El nuevo peso a asignar
     * @return La actividad actualizada como DTO
     */
    @Transactional
    public ActivityResponseDTO updateActivityWeight(String username, Long activityId, Double newWeight) {
        // Buscar al usuario
        UserEntity user = userEntityRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        // Buscar la actividad
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("Actividad no encontrada"));
        
        // Verificar que la actividad pertenezca al usuario o sea una actividad por defecto
        boolean isUserActivity = activity.getUser() != null && activity.getUser().getId().equals(user.getId());
        boolean isDefaultActivity = activity.getUser() == null;
        
        if (!isUserActivity && !isDefaultActivity) {
            throw new RuntimeException("No autorizado para modificar esta actividad");
        }
        
        // Limitar el valor del peso entre 0.1 y 10.0
        double limitedWeight = Math.max(0.1, Math.min(newWeight, 10.0));
        
        // Actualizar el peso de la actividad
        activity.setWeight(limitedWeight);
        
        // Guardar los cambios
        Activity updatedActivity = activityRepository.save(activity);
        
        // Convertir a DTO y devolver
        return convertToDTO(updatedActivity);
    }

    // Método auxiliar para convertir Activity a ActivityResponseDTO
    private ActivityResponseDTO convertToDTO(Activity activity) {
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
                activity.getMaxWindSpeed(),
                activity.getDefaultActivity() != null ? activity.getDefaultActivity().getId() : null,
                activity.getWasCustomized() != null ? activity.getWasCustomized() : false);
    }
}
