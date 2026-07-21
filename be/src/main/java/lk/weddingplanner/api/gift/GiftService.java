package lk.weddingplanner.api.gift;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import lk.weddingplanner.api.common.ApiException;
import lk.weddingplanner.api.domain.CashContribution;
import lk.weddingplanner.api.domain.CashFund;
import lk.weddingplanner.api.domain.ContributionStatus;
import lk.weddingplanner.api.domain.GiftClaim;
import lk.weddingplanner.api.domain.GiftItem;
import lk.weddingplanner.api.domain.Wedding;
import lk.weddingplanner.api.gift.dto.CashContributionResponse;
import lk.weddingplanner.api.gift.dto.CashFundResponse;
import lk.weddingplanner.api.gift.dto.ClaimGiftRequest;
import lk.weddingplanner.api.gift.dto.ContributeCashRequest;
import lk.weddingplanner.api.gift.dto.GiftClaimResponse;
import lk.weddingplanner.api.gift.dto.GiftItemResponse;
import lk.weddingplanner.api.gift.dto.HostRegistryResponse;
import lk.weddingplanner.api.gift.dto.PublicRegistryResponse;
import lk.weddingplanner.api.gift.dto.UpsertCashFundRequest;
import lk.weddingplanner.api.gift.dto.UpsertGiftItemRequest;
import lk.weddingplanner.api.repository.CashContributionRepository;
import lk.weddingplanner.api.repository.CashFundRepository;
import lk.weddingplanner.api.repository.GiftClaimRepository;
import lk.weddingplanner.api.repository.GiftItemRepository;
import lk.weddingplanner.api.repository.WeddingRepository;
import lk.weddingplanner.api.security.UserPrincipal;
import lk.weddingplanner.api.wedding.WeddingAccessService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class GiftService {

    private final GiftItemRepository giftItemRepository;
    private final GiftClaimRepository giftClaimRepository;
    private final CashFundRepository cashFundRepository;
    private final CashContributionRepository cashContributionRepository;
    private final WeddingRepository weddingRepository;
    private final WeddingAccessService weddingAccessService;

    @Transactional(readOnly = true)
    public HostRegistryResponse hostRegistry(UserPrincipal principal, Long weddingId) {
        weddingAccessService.requireMemberWedding(principal, weddingId);
        return new HostRegistryResponse(
                giftItemRepository.findAllByWeddingId(weddingId).stream()
                        .map(g -> toGift(g, true))
                        .toList(),
                cashFundRepository.findAllByWeddingId(weddingId).stream().map(this::toFund).toList(),
                cashContributionRepository.findAllByWeddingId(weddingId).stream()
                        .map(this::toContribution)
                        .toList());
    }

    @Transactional(readOnly = true)
    public PublicRegistryResponse publicRegistry(String slug) {
        Wedding wedding = requirePublicWedding(slug);
        return new PublicRegistryResponse(
                giftItemRepository.findPublicByWeddingId(wedding.getId()).stream()
                        .map(g -> toGift(g, false))
                        .toList(),
                cashFundRepository.findPublicByWeddingId(wedding.getId()).stream()
                        .map(this::toFund)
                        .toList());
    }

    @Transactional
    public GiftItemResponse createGift(
            UserPrincipal principal, Long weddingId, UpsertGiftItemRequest request) {
        Wedding wedding = weddingAccessService.requireMemberWedding(principal, weddingId);
        GiftItem item = new GiftItem();
        item.setWedding(wedding);
        applyGift(item, request);
        if (request.sortOrder() == null) {
            item.setSortOrder(giftItemRepository.findAllByWeddingId(weddingId).size());
        }
        item.setCreatedAt(Instant.now());
        giftItemRepository.save(item);
        return toGift(item, true);
    }

    @Transactional
    public GiftItemResponse updateGift(
            UserPrincipal principal, Long weddingId, Long giftId, UpsertGiftItemRequest request) {
        weddingAccessService.requireMemberWedding(principal, weddingId);
        GiftItem item = requireGift(weddingId, giftId);
        applyGift(item, request);
        if (item.getQuantityDesired() < item.getQuantityClaimed()) {
            throw new ApiException(
                    "Quantity desired cannot be less than already claimed ("
                            + item.getQuantityClaimed()
                            + ")",
                    HttpStatus.BAD_REQUEST);
        }
        giftItemRepository.save(item);
        return toGift(item, true);
    }

    @Transactional
    public void deleteGift(UserPrincipal principal, Long weddingId, Long giftId) {
        weddingAccessService.requireMemberWedding(principal, weddingId);
        GiftItem item = requireGift(weddingId, giftId);
        giftClaimRepository.deleteAll(giftClaimRepository.findAllByGiftItemId(giftId));
        giftItemRepository.delete(item);
    }

    @Transactional
    public GiftItemResponse claimGift(String slug, Long giftId, ClaimGiftRequest request) {
        Wedding wedding = requirePublicWedding(slug);
        GiftItem item =
                giftItemRepository
                        .findByIdAndWeddingId(giftId, wedding.getId())
                        .orElseThrow(() -> new ApiException("Gift not found", HttpStatus.NOT_FOUND));
        if (!item.isPublicVisible()) {
            throw new ApiException("Gift not found", HttpStatus.NOT_FOUND);
        }
        if (item.getQuantityClaimed() >= item.getQuantityDesired()) {
            throw new ApiException("This gift is already fully claimed", HttpStatus.CONFLICT);
        }

        GiftClaim claim = new GiftClaim();
        claim.setGiftItem(item);
        claim.setClaimerName(request.claimerName().trim());
        claim.setClaimerEmail(
                StringUtils.hasText(request.claimerEmail()) ? request.claimerEmail().trim() : null);
        claim.setMessage(StringUtils.hasText(request.message()) ? request.message().trim() : null);
        claim.setCreatedAt(Instant.now());
        giftClaimRepository.save(claim);

        item.setQuantityClaimed(item.getQuantityClaimed() + 1);
        giftItemRepository.save(item);
        return toGift(item, false);
    }

    @Transactional
    public CashFundResponse createFund(
            UserPrincipal principal, Long weddingId, UpsertCashFundRequest request) {
        Wedding wedding = weddingAccessService.requireMemberWedding(principal, weddingId);
        CashFund fund = new CashFund();
        fund.setWedding(wedding);
        applyFund(fund, request);
        if (request.sortOrder() == null) {
            fund.setSortOrder(cashFundRepository.findAllByWeddingId(weddingId).size());
        }
        fund.setCreatedAt(Instant.now());
        cashFundRepository.save(fund);
        return toFund(fund);
    }

    @Transactional
    public CashFundResponse updateFund(
            UserPrincipal principal, Long weddingId, Long fundId, UpsertCashFundRequest request) {
        weddingAccessService.requireMemberWedding(principal, weddingId);
        CashFund fund = requireFund(weddingId, fundId);
        applyFund(fund, request);
        cashFundRepository.save(fund);
        return toFund(fund);
    }

    @Transactional
    public void deleteFund(UserPrincipal principal, Long weddingId, Long fundId) {
        weddingAccessService.requireMemberWedding(principal, weddingId);
        CashFund fund = requireFund(weddingId, fundId);
        cashContributionRepository.deleteAll(cashContributionRepository.findAllByFundId(fundId));
        cashFundRepository.delete(fund);
    }

    @Transactional
    public CashContributionResponse contribute(
            String slug, Long fundId, ContributeCashRequest request) {
        Wedding wedding = requirePublicWedding(slug);
        CashFund fund =
                cashFundRepository
                        .findByIdAndWeddingId(fundId, wedding.getId())
                        .orElseThrow(() -> new ApiException("Fund not found", HttpStatus.NOT_FOUND));
        if (!fund.isPublicVisible()) {
            throw new ApiException("Fund not found", HttpStatus.NOT_FOUND);
        }

        CashContribution contribution = new CashContribution();
        contribution.setCashFund(fund);
        contribution.setContributorName(request.contributorName().trim());
        contribution.setContributorEmail(
                StringUtils.hasText(request.contributorEmail())
                        ? request.contributorEmail().trim()
                        : null);
        contribution.setAmount(request.amount());
        contribution.setMessage(StringUtils.hasText(request.message()) ? request.message().trim() : null);
        // Until PayHere: record as PENDING; host can confirm
        contribution.setStatus(ContributionStatus.PENDING);
        contribution.setCreatedAt(Instant.now());
        cashContributionRepository.save(contribution);
        return toContribution(contribution);
    }

    @Transactional
    public CashContributionResponse updateContributionStatus(
            UserPrincipal principal, Long weddingId, Long contributionId, ContributionStatus status) {
        weddingAccessService.requireMemberWedding(principal, weddingId);
        CashContribution contribution =
                cashContributionRepository
                        .findByIdAndWeddingId(contributionId, weddingId)
                        .orElseThrow(
                                () -> new ApiException("Contribution not found", HttpStatus.NOT_FOUND));
        contribution.setStatus(status);
        cashContributionRepository.save(contribution);
        return toContribution(contribution);
    }

    private Wedding requirePublicWedding(String slug) {
        if (!StringUtils.hasText(slug)) {
            throw new ApiException("Wedding not found", HttpStatus.NOT_FOUND);
        }
        Wedding wedding =
                weddingRepository
                        .findBySlug(slug.trim())
                        .orElseThrow(() -> new ApiException("Wedding not found", HttpStatus.NOT_FOUND));
        if (!wedding.isPublicEnabled()) {
            throw new ApiException("This wedding page is not published", HttpStatus.NOT_FOUND);
        }
        return wedding;
    }

    private GiftItem requireGift(Long weddingId, Long giftId) {
        return giftItemRepository
                .findByIdAndWeddingId(giftId, weddingId)
                .orElseThrow(() -> new ApiException("Gift not found", HttpStatus.NOT_FOUND));
    }

    private CashFund requireFund(Long weddingId, Long fundId) {
        return cashFundRepository
                .findByIdAndWeddingId(fundId, weddingId)
                .orElseThrow(() -> new ApiException("Fund not found", HttpStatus.NOT_FOUND));
    }

    private void applyGift(GiftItem item, UpsertGiftItemRequest request) {
        item.setTitle(request.title().trim());
        item.setDescription(blankToNull(request.description()));
        item.setImageUrl(blankToNull(request.imageUrl()));
        item.setStoreUrl(blankToNull(request.storeUrl()));
        item.setPriceAmount(request.priceAmount());
        item.setCurrency(
                StringUtils.hasText(request.currency()) ? request.currency().trim().toUpperCase() : "LKR");
        if (request.quantityDesired() != null) {
            item.setQuantityDesired(request.quantityDesired());
        }
        if (request.sortOrder() != null) {
            item.setSortOrder(request.sortOrder());
        }
        if (request.publicVisible() != null) {
            item.setPublicVisible(request.publicVisible());
        }
    }

    private void applyFund(CashFund fund, UpsertCashFundRequest request) {
        fund.setTitle(request.title().trim());
        fund.setDescription(blankToNull(request.description()));
        fund.setGoalAmount(request.goalAmount());
        fund.setCurrency(
                StringUtils.hasText(request.currency()) ? request.currency().trim().toUpperCase() : "LKR");
        fund.setImageUrl(blankToNull(request.imageUrl()));
        if (request.sortOrder() != null) {
            fund.setSortOrder(request.sortOrder());
        }
        if (request.publicVisible() != null) {
            fund.setPublicVisible(request.publicVisible());
        }
    }

    private GiftItemResponse toGift(GiftItem item, boolean includeClaims) {
        int remaining = Math.max(0, item.getQuantityDesired() - item.getQuantityClaimed());
        List<GiftClaimResponse> claims =
                includeClaims
                        ? giftClaimRepository.findAllByGiftItemId(item.getId()).stream()
                                .map(this::toClaim)
                                .toList()
                        : List.of();
        return new GiftItemResponse(
                item.getId(),
                item.getTitle(),
                item.getDescription(),
                item.getImageUrl(),
                item.getStoreUrl(),
                item.getPriceAmount(),
                item.getCurrency(),
                item.getQuantityDesired(),
                item.getQuantityClaimed(),
                remaining,
                remaining == 0,
                item.getSortOrder(),
                item.isPublicVisible(),
                claims);
    }

    private GiftClaimResponse toClaim(GiftClaim claim) {
        return new GiftClaimResponse(
                claim.getId(),
                claim.getClaimerName(),
                claim.getClaimerEmail(),
                claim.getMessage(),
                claim.getCreatedAt().toString());
    }

    private CashFundResponse toFund(CashFund fund) {
        BigDecimal raised =
                cashContributionRepository.sumByFundIdAndStatus(
                        fund.getId(), ContributionStatus.CONFIRMED);
        BigDecimal pending =
                cashContributionRepository.sumByFundIdAndStatus(
                        fund.getId(), ContributionStatus.PENDING);
        if (raised == null) raised = BigDecimal.ZERO;
        if (pending == null) pending = BigDecimal.ZERO;
        double percent = 0;
        if (fund.getGoalAmount().compareTo(BigDecimal.ZERO) > 0) {
            percent =
                    raised
                            .multiply(BigDecimal.valueOf(100))
                            .divide(fund.getGoalAmount(), 1, RoundingMode.HALF_UP)
                            .doubleValue();
        }
        return new CashFundResponse(
                fund.getId(),
                fund.getTitle(),
                fund.getDescription(),
                fund.getGoalAmount(),
                raised,
                pending,
                fund.getCurrency(),
                fund.getImageUrl(),
                fund.getSortOrder(),
                fund.isPublicVisible(),
                Math.min(100, percent));
    }

    private CashContributionResponse toContribution(CashContribution c) {
        return new CashContributionResponse(
                c.getId(),
                c.getCashFund().getId(),
                c.getCashFund().getTitle(),
                c.getContributorName(),
                c.getContributorEmail(),
                c.getAmount(),
                c.getMessage(),
                c.getStatus().name(),
                c.getCreatedAt().toString());
    }

    private static String blankToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }
}
