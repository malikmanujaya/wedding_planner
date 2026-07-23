package lk.weddingplanner.api.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;

public record UpdateUserRequest(
        @NotBlank @Size(max = 120) String fullName,
        @Size(min = 6, max = 100) String password,
        @NotEmpty List<String> roleCodes,
        Boolean active) {}
