//We used this file to get exceptions that we throw from BadRequestException, ResourceNotFoundException to get an answer for the client 

package com.team13.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.security.authentication.BadCredentialsException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class) // Cuando la solicitud no puede ser mapeada a un controlador (No
                                                       // existe en la base de datos)
    public ResponseEntity<Map<String, Object>> handleNotFound(Exception ex) {
        Map<String, Object> Errorbody = new HashMap<>();
        Errorbody.put("timestamp", LocalDateTime.now());
        Errorbody.put("status", HttpStatus.NOT_FOUND.value());
        Errorbody.put("error", "Not Found");
        Errorbody.put("message", ex.getMessage());
        return new ResponseEntity<>(Errorbody, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(BadRequestException.class) // Solicitud incorrecta (Datos enviados por cliente son invalidos)
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
    public ResponseEntity<Map<String, Object>> handleGeneralError(Exception ex, WebRequest request) {
        Map<String, Object> errorBody = new HashMap<>();
        errorBody.put("timestamp", LocalDateTime.now());
        errorBody.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        errorBody.put("error", "Internal Server Error");
        errorBody.put("message", ex.getMessage());
        errorBody.put("path", request.getDescription(false).replace("uri=", ""));
        return new ResponseEntity<>(errorBody, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleBadCredentials(BadCredentialsException ex, WebRequest request) {
        Map<String, Object> errorBody = new HashMap<>();
        errorBody.put("timestamp", LocalDateTime.now());
        errorBody.put("status", HttpStatus.UNAUTHORIZED.value());
        errorBody.put("error", "Unauthorized");
        errorBody.put("message", "Invalid Credentials");
        errorBody.put("path", request.getDescription(false).replace("uri=", ""));
        return new ResponseEntity<>(errorBody, HttpStatus.UNAUTHORIZED);
    }
}