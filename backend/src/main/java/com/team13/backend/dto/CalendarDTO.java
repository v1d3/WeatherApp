package com.team13.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class CalendarDTO {

    @NotNull
    private Long timestamp;

    @NotNull
    private Long activity_id;

    @NotNull
    private Long user_id;

}
