package lk.weddingplanner.api.vendor.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

public record UpsertPaymentRequest(
        @NotBlank @Size(min = 2, max = 80) String label,
        @NotNull BigDecimal amount,
        LocalDate dueDate) {}
