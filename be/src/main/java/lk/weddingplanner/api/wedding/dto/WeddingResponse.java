package lk.weddingplanner.api.wedding.dto;

import java.time.LocalDate;

public record WeddingResponse(
        Long id,
        String title,
        String slug,
        LocalDate weddingDate,
        String venue,
        String inviteCode,
        String membershipRole) {}
