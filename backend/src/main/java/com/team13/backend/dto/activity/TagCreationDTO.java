package com.team13.backend.dto.activity;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class TagCreationDTO {
    @NotNull
    private String name;
}
