package com.team13.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.team13.backend.dto.AuthResponseDTO;
import com.team13.backend.dto.UserLoginDTO;
import com.team13.backend.dto.UserRegisterDTO;
import com.team13.backend.security.JwtGenerator;
import com.team13.backend.service.UserEntityService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final UserEntityService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtGenerator jwtGenerator;
    private final UserEntityService userEntityService;

    public AuthController(UserEntityService userService, AuthenticationManager authenticationManager, JwtGenerator jwtGenerator, UserEntityService userEntityService) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.jwtGenerator = jwtGenerator;
        this.userEntityService = userEntityService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody UserLoginDTO authRequest) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwtToken = jwtGenerator.generateToken(authentication);
        return ResponseEntity.ok(new AuthResponseDTO(jwtToken));
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody UserRegisterDTO userRegisterDTO) {
        if(userService.existsByUsername(userRegisterDTO.getUsername())) {
            return ResponseEntity.badRequest().body("Username already exists");
        }
        userEntityService.registerUser(userRegisterDTO);
        return ResponseEntity.ok("User registered successfully");
    }
}
