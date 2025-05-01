//We used this file to get exceptions that we throw from BadRequestException, ResourceNotFoundException to get an answer for the client 

package com.team13.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class) // Cuando la solicitud no puede ser mapeada a un controlador
    public ResponseEntity<Map<String, Object>> handleNotFound(Exception ex) {
        Map<String, Object> Errorbody = new HashMap<>();
        Errorbody.put("timestamp", LocalDateTime.now());
        Errorbody.put("status", HttpStatus.NOT_FOUND.value());
        Errorbody.put("error", "Not Found");
        Errorbody.put("message", ex.getMessage());
        return new ResponseEntity<>(Errorbody, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(BadRequestException.class) // Solicitud incorrecta
    public ResponseEntity<Object> handleBadRequest(BadRequestException ex, WebRequest request) {
        Map<String, Object> Errorbody = new HashMap<>();
        Errorbody.put("timestamp", LocalDateTime.now());
        Errorbody.put("status", HttpStatus.BAD_REQUEST.value());
        Errorbody.put("error", "Bad Request");
        Errorbody.put("message", ex.getMessage());
        Errorbody.put("path", request.getDescription(false).replace("uri=", ""));
        return new ResponseEntity<>(Errorbody, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGeneralError(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error interno del servidor"));
    }
}