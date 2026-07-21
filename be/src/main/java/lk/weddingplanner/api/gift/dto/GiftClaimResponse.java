package lk.weddingplanner.api.gift.dto;

public record GiftClaimResponse(
        Long id, String claimerName, String claimerEmail, String message, String createdAt) {}
