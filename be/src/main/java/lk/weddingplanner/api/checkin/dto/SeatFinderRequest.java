package lk.weddingplanner.api.checkin.dto;

import jakarta.validation.constraints.NotBlank;

public record SeatFinderRequest(@NotBlank String guestName, @NotBlank String tableLabel) {}
