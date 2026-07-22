package lk.weddingplanner.api.thankyou;

import java.time.Instant;
import lk.weddingplanner.api.common.ApiException;
import lk.weddingplanner.api.domain.Guest;
import lk.weddingplanner.api.domain.ThankYouCard;
import lk.weddingplanner.api.domain.Wedding;
import lk.weddingplanner.api.repository.GuestRepository;
import lk.weddingplanner.api.repository.ThankYouCardRepository;
import lk.weddingplanner.api.security.UserPrincipal;
import lk.weddingplanner.api.thankyou.dto.PublicThankYouResponse;
import lk.weddingplanner.api.thankyou.dto.ThankYouCardResponse;
import lk.weddingplanner.api.thankyou.dto.UpsertThankYouCardRequest;
import lk.weddingplanner.api.wedding.WeddingAccessService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class ThankYouService {

    private final ThankYouCardRepository cardRepository;
    private final GuestRepository guestRepository;
    private final WeddingAccessService weddingAccessService;

    @Transactional(readOnly = true)
    public ThankYouCardResponse getForHost(UserPrincipal principal, Long weddingId) {
        weddingAccessService.requireMemberWedding(principal, weddingId);
        return cardRepository
                .findByWeddingId(weddingId)
                .map(this::toResponse)
                .orElse(null);
    }

    @Transactional
    public ThankYouCardResponse upsert(
            UserPrincipal principal, Long weddingId, UpsertThankYouCardRequest request) {
        Wedding wedding = weddingAccessService.requireMemberWedding(principal, weddingId);
        ThankYouCard card =
                cardRepository
                        .findByWeddingId(weddingId)
                        .orElseGet(
                                () -> {
                                    ThankYouCard c = new ThankYouCard();
                                    c.setWedding(wedding);
                                    return c;
                                });
        card.setTemplateKey(
                StringUtils.hasText(request.templateKey()) ? request.templateKey().trim() : "classic");
        card.setMessage(request.message().trim());
        card.setSignature(
                StringUtils.hasText(request.signature()) ? request.signature().trim() : null);
        card.setImageUrl(
                StringUtils.hasText(request.imageUrl()) ? request.imageUrl().trim() : null);
        card.setDesignedCardUrl(
                StringUtils.hasText(request.designedCardUrl())
                        ? request.designedCardUrl().trim()
                        : null);
        card.setUpdatedAt(Instant.now());
        cardRepository.save(card);
        return toResponse(card);
    }

    @Transactional(readOnly = true)
    public PublicThankYouResponse getForGuest(String token) {
        Guest guest =
                guestRepository
                        .findByInviteToken(token == null ? "" : token.trim())
                        .orElseThrow(
                                () -> new ApiException("Invitation not found", HttpStatus.NOT_FOUND));
        Wedding wedding = guest.getWedding();
        ThankYouCard card =
                cardRepository
                        .findByWeddingId(wedding.getId())
                        .orElseThrow(
                                () ->
                                        new ApiException(
                                                "No thank-you card has been published yet",
                                                HttpStatus.NOT_FOUND));

        String message = card.getMessage().replace("{name}", guest.getFullName());
        return new PublicThankYouResponse(
                card.getTemplateKey(),
                message,
                card.getSignature(),
                card.getImageUrl(),
                card.getDesignedCardUrl(),
                guest.getFullName(),
                wedding.getCoupleNames(),
                wedding.getTitle(),
                wedding.getWeddingDate() != null ? wedding.getWeddingDate().toString() : null);
    }

    private ThankYouCardResponse toResponse(ThankYouCard card) {
        return new ThankYouCardResponse(
                card.getId(),
                card.getTemplateKey(),
                card.getMessage(),
                card.getSignature(),
                card.getImageUrl(),
                card.getDesignedCardUrl(),
                card.getUpdatedAt());
    }
}
