package lk.weddingplanner.api.auth.dto;

public record AuthResponse(String token, Long userId, String email, String fullName) {}
