package lk.weddingplanner.api.thankyou.dto;

public record PublicThankYouResponse(
        String templateKey,
        String message,
        String signature,
        String imageUrl,
        String designedCardUrl,
        String guestName,
        String coupleNames,
        String weddingTitle,
        String weddingDate) {}
