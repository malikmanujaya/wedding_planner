package lk.weddingplanner.api.invite.dto;

import lk.weddingplanner.api.domain.RsvpStatus;

public record PublicInviteResponse(
        String token,
        String weddingTitle,
        String weddingDate,
        String venue,
        String guestName,
        String household,
        String mealPreference,
        RsvpStatus rsvpStatus,
        String tableLabel,
        String seatLabel,
        boolean seatAssigned) {}
