package lk.weddingplanner.api.gift.dto;

import java.math.BigDecimal;
import java.util.List;

public record GiftItemResponse(
        Long id,
        String title,
        String description,
        String imageUrl,
        String storeUrl,
        BigDecimal priceAmount,
        String currency,
        int quantityDesired,
        int quantityClaimed,
        int remaining,
        boolean fullyClaimed,
        int sortOrder,
        boolean publicVisible,
        List<GiftClaimResponse> claims) {}
