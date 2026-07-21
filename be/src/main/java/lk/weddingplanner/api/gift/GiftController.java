package lk.weddingplanner.api.gift;

import jakarta.validation.Valid;
import lk.weddingplanner.api.domain.ContributionStatus;
import lk.weddingplanner.api.gift.dto.CashContributionResponse;
import lk.weddingplanner.api.gift.dto.CashFundResponse;
import lk.weddingplanner.api.gift.dto.ClaimGiftRequest;
import lk.weddingplanner.api.gift.dto.ContributeCashRequest;
import lk.weddingplanner.api.gift.dto.GiftItemResponse;
import lk.weddingplanner.api.gift.dto.HostRegistryResponse;
import lk.weddingplanner.api.gift.dto.PublicRegistryResponse;
import lk.weddingplanner.api.gift.dto.UpsertCashFundRequest;
import lk.weddingplanner.api.gift.dto.UpsertGiftItemRequest;
import lk.weddingplanner.api.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class GiftController {

    private final GiftService giftService;

    @GetMapping("/api/public/weddings/{slug}/registry")
    public PublicRegistryResponse publicRegistry(@PathVariable String slug) {
        return giftService.publicRegistry(slug);
    }

    @PostMapping("/api/public/weddings/{slug}/registry/gifts/{giftId}/claim")
    public GiftItemResponse claim(
            @PathVariable String slug,
            @PathVariable Long giftId,
            @Valid @RequestBody ClaimGiftRequest request) {
        return giftService.claimGift(slug, giftId, request);
    }

    @PostMapping("/api/public/weddings/{slug}/registry/funds/{fundId}/contribute")
    public CashContributionResponse contribute(
            @PathVariable String slug,
            @PathVariable Long fundId,
            @Valid @RequestBody ContributeCashRequest request) {
        return giftService.contribute(slug, fundId, request);
    }

    @GetMapping("/api/weddings/{weddingId}/registry")
    public HostRegistryResponse hostRegistry(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable Long weddingId) {
        return giftService.hostRegistry(principal, weddingId);
    }

    @PostMapping("/api/weddings/{weddingId}/registry/gifts")
    public GiftItemResponse createGift(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long weddingId,
            @Valid @RequestBody UpsertGiftItemRequest request) {
        return giftService.createGift(principal, weddingId, request);
    }

    @PutMapping("/api/weddings/{weddingId}/registry/gifts/{giftId}")
    public GiftItemResponse updateGift(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long weddingId,
            @PathVariable Long giftId,
            @Valid @RequestBody UpsertGiftItemRequest request) {
        return giftService.updateGift(principal, weddingId, giftId, request);
    }

    @DeleteMapping("/api/weddings/{weddingId}/registry/gifts/{giftId}")
    public void deleteGift(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long weddingId,
            @PathVariable Long giftId) {
        giftService.deleteGift(principal, weddingId, giftId);
    }

    @PostMapping("/api/weddings/{weddingId}/registry/funds")
    public CashFundResponse createFund(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long weddingId,
            @Valid @RequestBody UpsertCashFundRequest request) {
        return giftService.createFund(principal, weddingId, request);
    }

    @PutMapping("/api/weddings/{weddingId}/registry/funds/{fundId}")
    public CashFundResponse updateFund(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long weddingId,
            @PathVariable Long fundId,
            @Valid @RequestBody UpsertCashFundRequest request) {
        return giftService.updateFund(principal, weddingId, fundId, request);
    }

    @DeleteMapping("/api/weddings/{weddingId}/registry/funds/{fundId}")
    public void deleteFund(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long weddingId,
            @PathVariable Long fundId) {
        giftService.deleteFund(principal, weddingId, fundId);
    }

    @PostMapping("/api/weddings/{weddingId}/registry/contributions/{contributionId}/status")
    public CashContributionResponse updateContributionStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long weddingId,
            @PathVariable Long contributionId,
            @RequestParam ContributionStatus status) {
        return giftService.updateContributionStatus(principal, weddingId, contributionId, status);
    }
}
