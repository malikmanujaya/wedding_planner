package lk.weddingplanner.api.admin.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;

public record CreateUserRequest(
        @NotBlank @Email @Size(max = 180) String email,
        @NotBlank @Size(max = 120) String fullName,
        @NotBlank @Size(min = 6, max = 100) String password,
        @NotEmpty List<String> roleCodes,
        Boolean active) {}
