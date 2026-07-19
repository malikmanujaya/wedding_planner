package lk.weddingplanner.api.wedding.dto;

import java.time.LocalDate;
import java.util.List;

public record WeddingPublicPageResponse(
        Long weddingId,
        String slug,
        String title,
        String coupleNames,
        LocalDate weddingDate,
        String venue,
        String story,
        String heroImageUrl,
        List<String> photoUrls,
        boolean publicEnabled) {}
