package lk.weddingplanner.api.seating.dto;

import tools.jackson.databind.JsonNode;

public record SeatingResponse(Long weddingId, JsonNode plan, int version) {}
