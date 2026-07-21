package lk.weddingplanner.api.gift.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record ContributeCashRequest(
        @NotBlank @Size(max = 120) String contributorName,
        @Email @Size(max = 180) String contributorEmail,
        @NotNull @DecimalMin("1") BigDecimal amount,
        @Size(max = 500) String message) {}
