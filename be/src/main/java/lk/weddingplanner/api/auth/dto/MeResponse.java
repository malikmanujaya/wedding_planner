package lk.weddingplanner.api.auth.dto;

public record MeResponse(Long id, String email, String fullName, String globalRole) {}
