package lk.weddingplanner.api.gift.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ClaimGiftRequest(
        @NotBlank @Size(max = 120) String claimerName,
        @Email @Size(max = 180) String claimerEmail,
        @Size(max = 500) String message) {}
