package com.team13.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import java.util.List;

public record ActivityModificationDTO(
    @Size(min = 1, max = 100) String name,
    
    List<Long> weatherIds,

    @Min(-274) @Max(100)
    Double minTemperature,

    @Min(-274) @Max(100)
    Double maxTemperature,
    
    @Min(0) @Max(100)
    Double minHumidity,
    
    @Min(0) @Max(100)
    Double maxHumidity,
    
    @Min(0)
    Double minWindSpeed,
    
    @Min(0)
    Double maxWindSpeed,

    List<Long> tagIds,
    
    @Min(1)
    Integer weight
) {}