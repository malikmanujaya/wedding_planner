package lk.weddingplanner.api.thankyou.dto;

import java.time.Instant;

public record ThankYouCardResponse(
        Long id,
        String templateKey,
        String message,
        String signature,
        String imageUrl,
        String designedCardUrl,
        Instant updatedAt) {}
