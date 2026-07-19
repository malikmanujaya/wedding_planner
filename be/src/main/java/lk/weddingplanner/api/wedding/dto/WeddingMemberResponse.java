package lk.weddingplanner.api.wedding.dto;

public record WeddingMemberResponse(
        Long membershipId,
        Long userId,
        String fullName,
        String email,
        String role,
        String responsibilities) {}
