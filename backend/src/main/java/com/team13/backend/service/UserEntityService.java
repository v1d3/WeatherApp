package com.team13.backend.service;

import java.util.List;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.team13.backend.dto.UserRegisterDTO;
import com.team13.backend.model.Role;
import com.team13.backend.model.UserEntity;
import com.team13.backend.repository.RoleRepository;
import com.team13.backend.repository.UserEntityRepository;

@Service
public class UserEntityService {
    private final BCryptPasswordEncoder passwordEncoder;
    private final UserEntityRepository userRepository;
    private final RoleRepository roleRepository;

    public UserEntityService(UserEntityRepository userRepository, RoleRepository roleRepository) {
        this.passwordEncoder = new BCryptPasswordEncoder();
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    public boolean existsByUsername(String username) {
        return userRepository.findByUsername(username).isPresent();
    }

    public UserEntity registerUser(UserRegisterDTO userRegisterDTO) {
        UserEntity user = new UserEntity();
        user.setUsername(userRegisterDTO.getUsername());
        user.setPassword(passwordEncoder.encode(userRegisterDTO.getPassword()));
        Role role = roleRepository.findByName(userRegisterDTO.isAdmin() ? "ROLE_ADMIN" : "ROLE_USER").orElseThrow(() -> new RuntimeException("Role not found"));
        user.setRoles(List.of(role));
        return userRepository.save(user);
    }
    
}
