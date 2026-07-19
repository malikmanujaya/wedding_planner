package lk.weddingplanner.api.wedding.dto;

import jakarta.validation.constraints.Size;
import java.util.List;

public record UpdatePublicPageRequest(
        @Size(max = 160) String coupleNames,
        @Size(max = 5000) String story,
        @Size(max = 500) String heroImageUrl,
        List<@Size(max = 500) String> photoUrls,
        Boolean publicEnabled) {}
