package lk.weddingplanner.api.thankyou.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpsertThankYouCardRequest(
        @Size(max = 40) String templateKey,
        @NotBlank @Size(max = 2000) String message,
        @Size(max = 160) String signature,
        @Size(max = 500) String imageUrl,
        @Size(max = 500) String designedCardUrl) {}
