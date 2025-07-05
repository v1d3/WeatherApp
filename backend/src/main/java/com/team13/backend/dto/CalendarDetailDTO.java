package com.team13.backend.dto;

import java.util.stream.Collectors;

import com.team13.backend.model.Calendar;

public record CalendarDetailDTO(
    Long id,
    Long timeInit,
    CalendarActivityDTO activity,
    String username
) {
    public static CalendarDetailDTO fromEntity(Calendar calendar) {
        CalendarActivityDTO activityDTO = null;
        if (calendar.getActivity() != null) {
            activityDTO = new CalendarActivityDTO(
                calendar.getActivity().getId(),
                calendar.getActivity().getName(),
                calendar.getActivity().getWeathers().stream()
                    .map(w -> new WeatherResponseDTO(w.getId(), w.getName()))
                    .collect(Collectors.toList())
            );
        }
        
        return new CalendarDetailDTO(
            calendar.getId(),
            calendar.getTimeInit(),
            activityDTO,
            calendar.getUserEntity() != null ? calendar.getUserEntity().getUsername() : null
        );
    }
}