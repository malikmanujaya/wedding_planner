package lk.weddingplanner.api.auth.dto;

import java.util.List;

public record MeResponse(Long id, String email, String fullName, List<String> roles, boolean active) {}
