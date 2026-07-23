package lk.weddingplanner.api.admin.dto;

import java.time.Instant;
import java.util.List;

public record AdminUserResponse(
        Long id,
        String email,
        String fullName,
        boolean active,
        List<RoleResponse> roles,
        Instant createdAt) {}
