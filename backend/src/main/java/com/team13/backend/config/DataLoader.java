package com.team13.backend.config;

import java.security.PrivateKey;
import java.time.Instant;
import java.util.List;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import com.team13.backend.model.Role;
import com.team13.backend.model.UserEntity;
import com.team13.backend.model.Weather;
import com.team13.backend.model.WeatherData;
import com.team13.backend.repository.RoleRepository;
import com.team13.backend.repository.UserEntityRepository;
import com.team13.backend.repository.WeatherDataRepository;
import com.team13.backend.repository.WeatherRepository;

import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;

@Component
public class DataLoader {
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final UserEntityRepository userEntityRepository;
    private final RoleRepository roleRepository;
    private final WeatherRepository weatherRepository;
    private final WeatherDataRepository weatherDataRepository;

    public DataLoader(UserEntityRepository userEntityRepository, RoleRepository roleRepository,
            WeatherRepository weatherRepository, WeatherDataRepository weatherDataRepository) {
        this.userEntityRepository = userEntityRepository;
        this.roleRepository = roleRepository;
        this.weatherRepository = weatherRepository;
        this.weatherDataRepository = weatherDataRepository;
    }

    @PostConstruct
    @Transactional
    public void loadData() {
        Role adminRole = createRoleIfNotFound("ROLE_ADMIN");
        createRoleIfNotFound("ROLE_USER");
        createUserIfNotFound("admin", List.of(adminRole));
        // Only creates weather if none exists, if it does then returns the first one
        // found
        // createMockWeather("rainy", Instant.now(), "Oficina de Javier Vidal");
        if (weatherRepository.count() == 0) {
            // Crear todos los tipos de clima con primera letra en mayúscula
            createWeatherIfNotFound("Despejado");
            createWeatherIfNotFound("Parcialmente nublado");
            createWeatherIfNotFound("Nublado");
            createWeatherIfNotFound("Muy nublado");
            createWeatherIfNotFound("Lluvia");
            createWeatherIfNotFound("Llovizna");
            createWeatherIfNotFound("Tormenta");
            createWeatherIfNotFound("Nieve");
            createWeatherIfNotFound("Neblina");
            createWeatherIfNotFound("Niebla");
            createWeatherIfNotFound("Polvo");
            createWeatherIfNotFound("Ceniza");
            createWeatherIfNotFound("Ráfagas");
            createWeatherIfNotFound("Tornado");
        }
    }

    @Transactional
    Role createRoleIfNotFound(String name) {
        Role role = roleRepository.findByName(name).orElse(null);
        if (role == null) {
            role = new Role();
            role.setName(name);
            role = roleRepository.save(role);
        }
        return role;
    }

    @Transactional
    UserEntity createUserIfNotFound(String username, List<Role> roles) {
        UserEntity user = userEntityRepository.findByUsername(username).orElse(null);
        if (user == null) {
            user = new UserEntity();
            user.setUsername(username);
            user.setPassword(passwordEncoder.encode("admin"));
            user.setRoles(roles);
            user = userEntityRepository.save(user);
        }
        return user;
    }

    @Transactional
    Weather createWeatherIfNotFound(String name) {
        Weather weather = weatherRepository.findByName(name).orElse(null);
        if (weather != null) {
            return weather;
        }
        weather = new Weather();
        weather.setName(name);
        weatherRepository.save(weather);
        return weather;
    }

    // @Transactional
    // WeatherData createMockWeather(String name, Instant date, String location){
    // List<WeatherData> weatherList = weatherRepository.findByName(name);
    // if(weatherList.isEmpty()){
    // WeatherData weather = new WeatherData();
    // weather.setName(name);
    // weather.setDateTime(date);
    // weather.setLocation(location);
    // weather = weatherRepository.save(weather);
    // return weather;
    // }
    // return weatherList.get(0);
    // }
}
