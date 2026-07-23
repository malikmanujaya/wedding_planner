package lk.weddingplanner.api.auth.dto;

import java.util.List;

public record AuthResponse(
        String token,
        String refreshToken,
        long expiresIn,
        Long userId,
        String email,
        String fullName,
        List<String> roles) {}
