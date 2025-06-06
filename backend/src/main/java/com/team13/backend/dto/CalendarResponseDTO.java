package com.team13.backend.dto;

public record CalendarResponseDTO (
    Long id,
    Long timestamp,
    Long activity_id,
    Long user_id
){}
