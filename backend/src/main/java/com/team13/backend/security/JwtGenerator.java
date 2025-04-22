package com.team13.backend.security;

import java.time.Instant;

import javax.crypto.SecretKey;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.Authentication;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Configuration
public class JwtGenerator {
    // TODO: Move to env variable or config file
    private static final SecretKey SECRET_KEY = Keys.hmacShaKeyFor("miaumiaumiaumiaumiaumiaumiaumiaumiaumiaumiaumiaumiaumiaumiau".getBytes());

    public JwtGenerator() {}

    public String generateToken(Authentication authentication) {
        String username = authentication.getName();
        Instant now = Instant.now();
        Instant expiryDate = now.plusSeconds(86400); // 1 day
        return Jwts.builder()
                .subject(username)
                .issuedAt(java.util.Date.from(now))
                .expiration(java.util.Date.from(expiryDate))
                .signWith(SECRET_KEY, Jwts.SIG.HS256)
                .compact();
    }

    public String getUserName(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(SECRET_KEY)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claims.getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(SECRET_KEY).build().parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }   
}
