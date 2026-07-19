package lk.weddingplanner.api.wedding.dto;

public record PublicRsvpLookupResponse(
        boolean matched,
        String message,
        String inviteToken,
        String guestName) {}
