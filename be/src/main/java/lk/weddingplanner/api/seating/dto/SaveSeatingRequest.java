package lk.weddingplanner.api.seating.dto;

import jakarta.validation.constraints.NotNull;
import tools.jackson.databind.JsonNode;

public record SaveSeatingRequest(@NotNull JsonNode plan, @NotNull Integer version) {}
