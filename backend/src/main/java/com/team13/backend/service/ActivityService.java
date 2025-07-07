package com.team13.backend.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.apache.coyote.BadRequestException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.team13.backend.dto.activity.ActivityCreationDTO;
import com.team13.backend.dto.activity.ActivityModificationDTO;
import com.team13.backend.dto.activity.ActivityResponseDTO;
import com.team13.backend.dto.WeatherResponseDTO;
import com.team13.backend.dto.TagResponseDTO;
import com.team13.backend.model.Activity;
import com.team13.backend.model.DefaultActivity;
import com.team13.backend.model.UserEntity;
import com.team13.backend.model.Weather;
import com.team13.backend.model.Tag;
import com.team13.backend.repository.ActivityRepository;
import com.team13.backend.repository.UserEntityRepository;
import com.team13.backend.repository.WeatherRepository;
import com.team13.backend.repository.TagRepository;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.hibernate.Hibernate;

@Service
public class ActivityService {
    private final ActivityRepository activityRepository;
    private final WeatherRepository weatherRepository;
    private final UserEntityRepository userEntityRepository; // Add this repository
    private final DefaultActivityService defaultActivityService;
    private final TagRepository tagRepository; // Añadir este repositorio

    public ActivityService(ActivityRepository activityRepository,
            WeatherRepository weatherRepository,
            UserEntityRepository userEntityRepository,
            DefaultActivityService defaultActivityService,
            TagRepository tagRepository) { // Añadir el parámetro
        this.activityRepository = activityRepository;
        this.weatherRepository = weatherRepository;
        this.userEntityRepository = userEntityRepository;
        this.defaultActivityService = defaultActivityService;
        this.tagRepository = tagRepository; // Asignar el repositorio
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

                    List<TagResponseDTO> tagResponses = activity.getTags().stream()
                            .map(tag -> new TagResponseDTO(tag.getId(), tag.getName()))
                            .collect(Collectors.toList());

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
                            activity.getWasCustomized() != null ? activity.getWasCustomized() : false,
                            activity.getWeight(), tagResponses);
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

        // === AGREGAR ESTO ===
        if (activityCreationDTO.getTagIds() != null) {
            List<Tag> tags = tagRepository.findAllById(activityCreationDTO.getTagIds());
            activity.setTags(tags);
        }

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

        // Inicializar explícitamente las relaciones lazy
        activities.forEach(activity -> {
            Hibernate.initialize(activity.getWeathers());
            Hibernate.initialize(activity.getTags());
        });

        // Convertir a DTOs
        return activities.stream()
                .map(activity -> {
                    List<WeatherResponseDTO> weatherResponses = activity.getWeathers().stream()
                            .map(weather -> new WeatherResponseDTO(
                                    weather.getId(),
                                    weather.getName()))
                            .collect(java.util.stream.Collectors.toList());

                    List<TagResponseDTO> tagResponses = activity.getTags().stream()
                            .map(tag -> new TagResponseDTO(tag.getId(), tag.getName()))
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
                            activity.getWasCustomized() != null ? activity.getWasCustomized() : false,
                            activity.getWeight(), tagResponses);
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

                    List<TagResponseDTO> tagResponses = activity.getTags().stream()
                            .map(tag -> new TagResponseDTO(tag.getId(), tag.getName()))
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
                            activity.getWasCustomized() != null ? activity.getWasCustomized() : false,
                            activity.getWeight(), tagResponses);
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

                    List<TagResponseDTO> tagResponses = activity.getTags().stream()
                            .map(tag -> new TagResponseDTO(tag.getId(), tag.getName()))
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
                            null,
                            false,
                            1.0, tagResponses);
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

        List<TagResponseDTO> tagResponses = activity.getTags().stream()
                .map(tag -> new TagResponseDTO(tag.getId(), tag.getName()))
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
                activity.getWasCustomized() != null ? activity.getWasCustomized() : false,
                activity.getWeight(), tagResponses);
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

        // Añadir este bloque para manejar el peso
        if (customizationData.getWeight() != null) {
            activity.setWeight(Math.max(0.1, Math.min(customizationData.getWeight(), 10.0)));
        }

        // Marcar como personalizada
        activity.setWasCustomized(true);

        // === AGREGAR ESTO antes de guardar ===
        if (customizationData.getTagIds() != null) {
            List<Tag> tags = tagRepository.findAllById(customizationData.getTagIds());
            activity.setTags(tags);
        }

        // Guardar los cambios
        Activity updatedActivity = activityRepository.save(activity);

        // Convertir a DTO y devolver
        List<WeatherResponseDTO> weatherResponses = updatedActivity.getWeathers().stream()
                .map(weather -> new WeatherResponseDTO(
                        weather.getId(),
                        weather.getName()))
                .collect(java.util.stream.Collectors.toList());

        List<TagResponseDTO> tagResponses = activity.getTags().stream()
                .map(tag -> new TagResponseDTO(tag.getId(), tag.getName()))
                .collect(Collectors.toList());

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
                updatedActivity.getWasCustomized() != null ? updatedActivity.getWasCustomized() : true,
                activity.getWeight(), tagResponses);
    }

    /**
     * Actualiza el peso (valoración) de una actividad para un usuario específico
     * 
     * @param username   El nombre de usuario
     * @param activityId El ID de la actividad
     * @param newWeight  El nuevo peso a asignar
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

        // Verificar que la actividad pertenezca al usuario o sea una actividad por
        // defecto
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

    /**
     * Modifica una actividad existente del usuario, tratándola como predeterminada
     * o no según el parámetro
     * 
     * @param username        El nombre de usuario del dueño de la actividad
     * @param activityId      El ID de la actividad a modificar
     * @param modificationDTO Los datos para la modificación
     * @param isDefault       Indica si se debe tratar como una actividad
     *                        predeterminada
     * @return La actividad modificada
     */
    @Transactional
    public ActivityResponseDTO modifyActivity(String username, Long activityId,
            ActivityModificationDTO modificationDTO,
            boolean isDefault) {
        // Buscar al usuario
        UserEntity user = userEntityRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (isDefault) {
            // Si es una actividad predeterminada, usar el servicio existente para
            // personalizar
            DefaultActivity defaultActivity = defaultActivityService.getDefaultActivityModelById(activityId);
            if (defaultActivity == null) {
                throw new RuntimeException("Actividad predeterminada no encontrada");
            }

            // Convertir ActivityModificationDTO a ActivityCreationDTO para compatibilidad
            ActivityCreationDTO creationDTO = convertToCreationDTO(modificationDTO);

            try {
                return customizeDefaultActivity(username, activityId, creationDTO);
            } catch (BadRequestException e) {
                throw new RuntimeException("Error al personalizar actividad: " + e.getMessage());
            }
        } else {
            // Si no es predeterminada, modificar directamente en la tabla de actividades
            Activity activity = activityRepository.findById(activityId)
                    .orElseThrow(() -> new RuntimeException("Actividad no encontrada"));

            // Verificar que la actividad pertenezca al usuario
            if (!activity.getUser().getId().equals(user.getId())) {
                throw new RuntimeException("No autorizado para modificar esta actividad");
            }

            // Actualizar los campos con los datos del DTO
            if (modificationDTO.name() != null) {
                activity.setName(modificationDTO.name());
            }

            if (modificationDTO.weatherIds() != null) {
                List<Weather> weathers = weatherRepository.findAllById(modificationDTO.weatherIds());
                activity.setWeathers(weathers);
            }

            if (modificationDTO.minTemperature() != null) {
                activity.setMinTemperature(modificationDTO.minTemperature());
            }

            if (modificationDTO.maxTemperature() != null) {
                activity.setMaxTemperature(modificationDTO.maxTemperature());
            }

            if (modificationDTO.minHumidity() != null) {
                activity.setMinHumidity(modificationDTO.minHumidity());
            }

            if (modificationDTO.maxHumidity() != null) {
                activity.setMaxHumidity(modificationDTO.maxHumidity());
            }

            if (modificationDTO.minWindSpeed() != null) {
                activity.setMinWindSpeed(modificationDTO.minWindSpeed());
            }

            if (modificationDTO.maxWindSpeed() != null) {
                activity.setMaxWindSpeed(modificationDTO.maxWindSpeed());
            }

            if (modificationDTO.tagIds() != null) {
                List<Tag> tags = tagRepository.findAllById(modificationDTO.tagIds());
                activity.setTags(tags);
            }

            // Actualizar el peso solo si está presente en el DTO
            if (modificationDTO.weight() != null) {
                activity.setWeight(Math.max(0.1, Math.min(modificationDTO.weight(), 10.0)));
            }

            // Guardar la actividad actualizada
            Activity updatedActivity = activityRepository.save(activity);
            return convertToDTO(updatedActivity);
        }
    }

    /**
     * Método auxiliar para convertir ActivityModificationDTO a ActivityCreationDTO
     */
    private ActivityCreationDTO convertToCreationDTO(ActivityModificationDTO modificationDTO) {
        return new ActivityCreationDTO(
                modificationDTO.name(),
                modificationDTO.weatherIds(),
                modificationDTO.minTemperature(),
                modificationDTO.maxTemperature(),
                modificationDTO.minHumidity(),
                modificationDTO.maxHumidity(),
                modificationDTO.minWindSpeed(),
                modificationDTO.maxWindSpeed(),
                modificationDTO.tagIds(),
                modificationDTO.weight() != null ? modificationDTO.weight() : null);
    }

    // Método auxiliar para convertir Activity a ActivityResponseDTO
    private ActivityResponseDTO convertToDTO(Activity activity) {
    List<WeatherResponseDTO> weatherResponses = activity.getWeathers().stream()
        .map(weather -> new WeatherResponseDTO(weather.getId(), weather.getName()))
        .collect(Collectors.toList());

    List<TagResponseDTO> tagResponses = activity.getTags().stream()
        .map(tag -> new TagResponseDTO(tag.getId(), tag.getName()))
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
        activity.getWasCustomized() != null ? activity.getWasCustomized() : false,
        activity.getWeight(),
        tagResponses // <-- Agrega esto
    );
    }

    public boolean deleteActivity(Long id) {
    String username = SecurityContextHolder.getContext().getAuthentication().getName();
    Activity activity = activityRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Activity not found"));

    // Verifica que la actividad pertenezca al usuario autenticado
    if (!activity.getUser().getUsername().equals(username)) {
        throw new AccessDeniedException("User is not owner of the activity");
    }

    activityRepository.delete(activity);
    return true;
}
}