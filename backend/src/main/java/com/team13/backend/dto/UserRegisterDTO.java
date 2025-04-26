package com.team13.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class UserRegisterDTO {
    @NotNull
    @Size(min = 4, max = 12)
    private String username;
    @NotNull
    @Size(min = 8, max = 64)
    @Pattern(regexp = "^[a-zA-Z0-9]*$")
    private String password;
    @NotNull
    private boolean isAdmin;
}
