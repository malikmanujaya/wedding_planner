package lk.weddingplanner.api.gift.dto;

import java.math.BigDecimal;

public record CashContributionResponse(
        Long id,
        Long fundId,
        String fundTitle,
        String contributorName,
        String contributorEmail,
        BigDecimal amount,
        String message,
        String status,
        String createdAt) {}
