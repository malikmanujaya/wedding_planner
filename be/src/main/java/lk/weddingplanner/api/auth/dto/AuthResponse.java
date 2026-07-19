package lk.weddingplanner.api.auth.dto;

public record AuthResponse(
        String token,
        String refreshToken,
        long expiresIn,
        Long userId,
        String email,
        String fullName) {}
