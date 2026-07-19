package lk.weddingplanner.api.wedding;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import lk.weddingplanner.api.common.ApiException;
import lk.weddingplanner.api.domain.Guest;
import lk.weddingplanner.api.domain.Wedding;
import lk.weddingplanner.api.invite.InviteService;
import lk.weddingplanner.api.repository.GuestRepository;
import lk.weddingplanner.api.repository.WeddingRepository;
import lk.weddingplanner.api.security.UserPrincipal;
import lk.weddingplanner.api.wedding.dto.PublicRsvpLookupRequest;
import lk.weddingplanner.api.wedding.dto.PublicRsvpLookupResponse;
import lk.weddingplanner.api.wedding.dto.PublicWeddingResponse;
import lk.weddingplanner.api.wedding.dto.UpdatePublicPageRequest;
import lk.weddingplanner.api.wedding.dto.WeddingPublicPageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Service
@RequiredArgsConstructor
public class PublicWeddingService {

    private final WeddingRepository weddingRepository;
    private final GuestRepository guestRepository;
    private final WeddingAccessService weddingAccessService;
    private final InviteService inviteService;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public PublicWeddingResponse getPublicBySlug(String slug) {
        Wedding wedding = requireBySlug(slug);
        if (!wedding.isPublicEnabled()) {
            throw new ApiException("This wedding page is not published", HttpStatus.NOT_FOUND);
        }
        return toPublic(wedding);
    }

    @Transactional(readOnly = true)
    public WeddingPublicPageResponse getForHost(UserPrincipal principal, Long weddingId) {
        Wedding wedding = weddingAccessService.requireMemberWedding(principal, weddingId);
        return toHost(wedding);
    }

    @Transactional
    public WeddingPublicPageResponse updateForHost(
            UserPrincipal principal, Long weddingId, UpdatePublicPageRequest request) {
        Wedding wedding = weddingAccessService.requireMemberWedding(principal, weddingId);
        if (request.coupleNames() != null) {
            wedding.setCoupleNames(blankToNull(request.coupleNames()));
        }
        if (request.story() != null) {
            wedding.setStory(blankToNull(request.story()));
        }
        if (request.heroImageUrl() != null) {
            wedding.setHeroImageUrl(blankToNull(request.heroImageUrl()));
        }
        if (request.photoUrls() != null) {
            wedding.setPhotoStrip(writePhotoUrls(request.photoUrls()));
        }
        if (request.publicEnabled() != null) {
            wedding.setPublicEnabled(request.publicEnabled());
        }
        weddingRepository.save(wedding);
        return toHost(wedding);
    }

    @Transactional
    public PublicRsvpLookupResponse lookupRsvp(String slug, PublicRsvpLookupRequest request) {
        Wedding wedding = requireBySlug(slug);
        if (!wedding.isPublicEnabled()) {
            throw new ApiException("This wedding page is not published", HttpStatus.NOT_FOUND);
        }

        String name = request.fullName().trim();
        Guest guest;
        if (StringUtils.hasText(request.email())) {
            guest =
                    guestRepository
                            .findByWeddingIdAndFullNameAndEmailIgnoreCase(
                                    wedding.getId(), name, request.email().trim())
                            .orElse(null);
            if (guest == null) {
                return new PublicRsvpLookupResponse(
                        false,
                        "No guest matched that name and email. Check the spelling or ask the couple.",
                        null,
                        null);
            }
        } else {
            List<Guest> matches =
                    guestRepository.findByWeddingIdAndFullNameIgnoreCase(wedding.getId(), name);
            if (matches.isEmpty()) {
                return new PublicRsvpLookupResponse(
                        false,
                        "No guest matched that name. Try your full name as on the invitation.",
                        null,
                        null);
            }
            if (matches.size() > 1) {
                return new PublicRsvpLookupResponse(
                        false,
                        "Several guests share that name. Enter the email on your invitation to continue.",
                        null,
                        null);
            }
            guest = matches.get(0);
        }

        inviteService.ensureToken(guest);
        guestRepository.save(guest);
        return new PublicRsvpLookupResponse(
                true, "Invitation found", guest.getInviteToken(), guest.getFullName());
    }

    private Wedding requireBySlug(String slug) {
        if (!StringUtils.hasText(slug)) {
            throw new ApiException("Wedding not found", HttpStatus.NOT_FOUND);
        }
        return weddingRepository
                .findBySlug(slug.trim())
                .orElseThrow(() -> new ApiException("Wedding not found", HttpStatus.NOT_FOUND));
    }

    private PublicWeddingResponse toPublic(Wedding wedding) {
        return new PublicWeddingResponse(
                wedding.getSlug(),
                wedding.getTitle(),
                wedding.getCoupleNames(),
                wedding.getWeddingDate(),
                wedding.getVenue(),
                wedding.getStory(),
                wedding.getHeroImageUrl(),
                readPhotoUrls(wedding.getPhotoStrip()),
                wedding.isPublicEnabled());
    }

    private WeddingPublicPageResponse toHost(Wedding wedding) {
        return new WeddingPublicPageResponse(
                wedding.getId(),
                wedding.getSlug(),
                wedding.getTitle(),
                wedding.getCoupleNames(),
                wedding.getWeddingDate(),
                wedding.getVenue(),
                wedding.getStory(),
                wedding.getHeroImageUrl(),
                readPhotoUrls(wedding.getPhotoStrip()),
                wedding.isPublicEnabled());
    }

    private List<String> readPhotoUrls(String json) {
        if (!StringUtils.hasText(json)) {
            return List.of();
        }
        try {
            JsonNode node = objectMapper.readTree(json);
            if (!node.isArray()) {
                return List.of();
            }
            List<String> urls = new ArrayList<>();
            for (JsonNode item : node) {
                if (item.isTextual() && StringUtils.hasText(item.asText())) {
                    urls.add(item.asText().trim());
                }
            }
            return urls;
        } catch (Exception e) {
            return List.of();
        }
    }

    private String writePhotoUrls(List<String> urls) {
        List<String> cleaned =
                Optional.ofNullable(urls).orElse(List.of()).stream()
                        .filter(StringUtils::hasText)
                        .map(String::trim)
                        .distinct()
                        .limit(12)
                        .toList();
        try {
            return objectMapper.writeValueAsString(cleaned);
        } catch (Exception e) {
            throw new ApiException("Could not save photo URLs", HttpStatus.BAD_REQUEST);
        }
    }

    private static String blankToNull(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }
}
