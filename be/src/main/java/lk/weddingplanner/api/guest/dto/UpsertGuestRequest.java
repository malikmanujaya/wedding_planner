package lk.weddingplanner.api.guest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lk.weddingplanner.api.domain.RsvpStatus;

public record UpsertGuestRequest(
        @NotBlank @Size(min = 2, max = 120) String fullName,
        @Size(max = 180) String email,
        @Size(max = 40) String phone,
        @Size(max = 120) String household,
        @Size(max = 80) String mealPreference,
        @NotNull RsvpStatus rsvpStatus,
        @Size(max = 200) String tags,
        @Size(max = 80) String tableLabel,
        @Size(max = 500) String notes) {}
