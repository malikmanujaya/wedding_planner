package lk.weddingplanner.api.gift.dto;

import java.util.List;

public record HostRegistryResponse(
        List<GiftItemResponse> gifts,
        List<CashFundResponse> cashFunds,
        List<CashContributionResponse> contributions) {}
