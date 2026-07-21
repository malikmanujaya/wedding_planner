package lk.weddingplanner.api.gift.dto;

import java.util.List;

public record PublicRegistryResponse(
        List<GiftItemResponse> gifts, List<CashFundResponse> cashFunds) {}
