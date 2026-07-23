package lk.weddingplanner.api.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpsertRoleRequest(
        /** Ignored on create (server-generated) and updates (immutable). */
        @Size(max = 60) String code,
        @NotBlank @Size(max = 120) String name,
        @Size(max = 500) String description,
        Boolean active) {}
