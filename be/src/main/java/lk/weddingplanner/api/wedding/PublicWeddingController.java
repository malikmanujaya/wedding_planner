package lk.weddingplanner.api.wedding;

import jakarta.validation.Valid;
import lk.weddingplanner.api.security.UserPrincipal;
import lk.weddingplanner.api.wedding.dto.PublicRsvpLookupRequest;
import lk.weddingplanner.api.wedding.dto.PublicRsvpLookupResponse;
import lk.weddingplanner.api.wedding.dto.PublicWeddingResponse;
import lk.weddingplanner.api.wedding.dto.UpdatePublicPageRequest;
import lk.weddingplanner.api.wedding.dto.WeddingPublicPageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class PublicWeddingController {

    private final PublicWeddingService publicWeddingService;

    @GetMapping("/api/public/weddings/{slug}")
    public PublicWeddingResponse getPublic(@PathVariable String slug) {
        return publicWeddingService.getPublicBySlug(slug);
    }

    @PostMapping("/api/public/weddings/{slug}/rsvp-lookup")
    public PublicRsvpLookupResponse rsvpLookup(
            @PathVariable String slug, @Valid @RequestBody PublicRsvpLookupRequest request) {
        return publicWeddingService.lookupRsvp(slug, request);
    }

    @GetMapping("/api/weddings/{weddingId}/public-page")
    public WeddingPublicPageResponse getForHost(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable Long weddingId) {
        return publicWeddingService.getForHost(principal, weddingId);
    }

    @PutMapping("/api/weddings/{weddingId}/public-page")
    public WeddingPublicPageResponse updateForHost(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long weddingId,
            @Valid @RequestBody UpdatePublicPageRequest request) {
        return publicWeddingService.updateForHost(principal, weddingId, request);
    }
}
