package lk.weddingplanner.api.gift.dto;

import java.math.BigDecimal;

public record CashFundResponse(
        Long id,
        String title,
        String description,
        BigDecimal goalAmount,
        BigDecimal raisedAmount,
        BigDecimal pendingAmount,
        String currency,
        String imageUrl,
        int sortOrder,
        boolean publicVisible,
        double progressPercent) {}
