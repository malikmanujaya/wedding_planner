package lk.weddingplanner.api.invite.dto;

import jakarta.validation.constraints.NotNull;
import lk.weddingplanner.api.domain.RsvpStatus;

public record PublicRsvpRequest(
        @NotNull RsvpStatus rsvpStatus, String mealPreference, String notes) {}
