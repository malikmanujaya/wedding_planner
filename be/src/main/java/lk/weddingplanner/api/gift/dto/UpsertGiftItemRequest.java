package lk.weddingplanner.api.gift.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record UpsertGiftItemRequest(
        @NotBlank @Size(max = 160) String title,
        @Size(max = 1000) String description,
        @Size(max = 500) String imageUrl,
        @Size(max = 500) String storeUrl,
        @DecimalMin("0") BigDecimal priceAmount,
        @Size(max = 8) String currency,
        @Min(1) Integer quantityDesired,
        Integer sortOrder,
        Boolean publicVisible) {}
