package lk.weddingplanner.api.vendor.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import lk.weddingplanner.api.domain.VendorBookingStatus;
import lk.weddingplanner.api.domain.VendorCategory;

public record UpsertVendorRequest(
        @NotBlank @Size(min = 2, max = 160) String name,
        @NotNull VendorCategory category,
        @NotNull VendorBookingStatus status,
        @Size(max = 120) String contactName,
        @Size(max = 180) String email,
        @Size(max = 40) String phone,
        BigDecimal quotedAmount,
        BigDecimal advanceAmount,
        LocalDate advanceDueDate,
        LocalDate remainingDueDate,
        @Size(max = 1000) String notes) {}
