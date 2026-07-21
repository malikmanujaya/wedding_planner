package lk.weddingplanner.api.gift.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record UpsertCashFundRequest(
        @NotBlank @Size(max = 160) String title,
        @Size(max = 1000) String description,
        @NotNull @DecimalMin("1") BigDecimal goalAmount,
        @Size(max = 8) String currency,
        @Size(max = 500) String imageUrl,
        Integer sortOrder,
        Boolean publicVisible) {}
