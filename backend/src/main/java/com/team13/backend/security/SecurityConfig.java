package com.team13.backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter, JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.jwtAuthenticationEntryPoint = jwtAuthenticationEntryPoint;
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint(jwtAuthenticationEntryPoint))     
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers("/api/test/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/weather/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/v1/weather-data/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/v1/activity/**").hasRole("USER")
                // Nuevas restricciones para tags
                .requestMatchers(HttpMethod.POST, "/api/tags/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/tags/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/tags/**").hasRole("ADMIN")
                // Restricciones para default_activities
                .requestMatchers("/api/v1/default-activity/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/v1/default-activity/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/v1/default-activity/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/default-activity/**").hasRole("ADMIN")
                // Restricciones para calendar
                .requestMatchers("/api/v1/calendar/**").authenticated()
                .requestMatchers("/error").permitAll()
                // Allow USER role to customize default activities
                .requestMatchers("/api/v1/user-activity/**").hasRole("USER")
                .anyRequest().authenticated())
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

    @Bean
    UrlBasedCorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.addAllowedOriginPattern("*");
        configuration.addAllowedMethod("*");
        configuration.addAllowedHeader("*");
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
