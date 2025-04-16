package com.team13.backend.config;

import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Component;

import com.team13.backend.model.Role;
import com.team13.backend.model.UserEntity;
import com.team13.backend.model.Weather;
import com.team13.backend.repository.RoleRepository;
import com.team13.backend.repository.UserEntityRepository;
import com.team13.backend.repository.WeatherRepository;

import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;

@Component
public class DataLoader {
    private final UserEntityRepository userEntityRepository;
    private final RoleRepository roleRepository;
    private final WeatherRepository weatherRepository;

    public DataLoader(UserEntityRepository userEntityRepository, RoleRepository roleRepository, WeatherRepository weatherRepository) {
        this.userEntityRepository = userEntityRepository;
        this.roleRepository = roleRepository;
        this.weatherRepository = weatherRepository;
    }

    @PostConstruct
    @Transactional
    public void loadData(){
        Role adminRole = createRoleIfNotFound("ROLE_ADMIN");
        Role userRole = createRoleIfNotFound("ROLE_USER");
        UserEntity adminUser = createUserIfNotFound("admin", List.of(adminRole));
        Weather mockWeather = createMockWeather("rainy", Instant.now(), "Oficina de Javier Vidal");
    }

    @Transactional
    Role createRoleIfNotFound(String name){
        Role role = roleRepository.findByName(name);
        if(role == null){
            role = new Role();
            role.setName(name);
            role = roleRepository.save(role);
        }
        return role;
    }

    @Transactional
    UserEntity createUserIfNotFound(String username, List<Role> roles){
        UserEntity user = userEntityRepository.findByUsername(username);
        if(user == null){
            user = new UserEntity();
            user.setUsername(username);
            user.setRoles(roles);
            user = userEntityRepository.save(user);
        }
        return user;
    }

    @Transactional
    Weather createMockWeather(String name, Instant date, String location){
        Weather weather = weatherRepository.findByName(name);
        if(weather == null){
            weather = new Weather();
            weather.setName(name);
            weather.setDateTime(date);
            weather.setLocation(location);
            weather = weatherRepository.save(weather);
        }
        return weather;
    }
}
