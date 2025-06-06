package com.team13.backend.dto.activity;

import java.util.List;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class ActivityCreationDTO {
    @NotNull
    private String name;
    @NotNull @Min(-274) @Max(100)
    private Double minTemperature;
    @NotNull @Min(-274) @Max(100)
    private Double maxTemperature;
    @NotNull @Min(0) @Max(100)
    private Double minHumidity;
    @NotNull @Min(0) @Max(100)
    private Double maxHumidity;
    @NotNull @Min(0)
    private Double minWindSpeed;
    @NotNull @Min(0)
    private Double maxWindSpeed;
    private List<Long> weatherIds;
}
