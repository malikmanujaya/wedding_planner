package lk.weddingplanner.api.admin.dto;

public record RoleResponse(
        Long id,
        String code,
        String name,
        String description,
        boolean systemRole,
        boolean active) {}
