package lk.weddingplanner.api.thankyou;

import jakarta.validation.Valid;
import lk.weddingplanner.api.security.UserPrincipal;
import lk.weddingplanner.api.thankyou.dto.PublicThankYouResponse;
import lk.weddingplanner.api.thankyou.dto.ThankYouCardResponse;
import lk.weddingplanner.api.thankyou.dto.UpsertThankYouCardRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class ThankYouController {

    private final ThankYouService thankYouService;

    @GetMapping("/api/weddings/{weddingId}/thank-you-card")
    public ResponseEntity<ThankYouCardResponse> get(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable Long weddingId) {
        ThankYouCardResponse card = thankYouService.getForHost(principal, weddingId);
        return card != null ? ResponseEntity.ok(card) : ResponseEntity.noContent().build();
    }

    @PutMapping("/api/weddings/{weddingId}/thank-you-card")
    public ThankYouCardResponse upsert(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long weddingId,
            @Valid @RequestBody UpsertThankYouCardRequest request) {
        return thankYouService.upsert(principal, weddingId, request);
    }

    @GetMapping("/api/public/invites/{token}/thank-you")
    public PublicThankYouResponse publicCard(@PathVariable String token) {
        return thankYouService.getForGuest(token);
    }
}
