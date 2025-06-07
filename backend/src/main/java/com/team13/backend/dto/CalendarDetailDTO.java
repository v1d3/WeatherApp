package com.team13.backend.dto;

import java.util.List;
import java.util.stream.Collectors;

import com.team13.backend.model.Calendar;

public record CalendarDetailDTO(
    Long id,
    Long timeInit,
    ActivityDTO activity,
    String username
) {
    public static CalendarDetailDTO fromEntity(Calendar calendar) {
        ActivityDTO activityDTO = null;
        if (calendar.getActivity() != null) {
            activityDTO = new ActivityDTO(
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