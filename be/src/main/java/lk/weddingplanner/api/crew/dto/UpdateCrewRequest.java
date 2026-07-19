package lk.weddingplanner.api.crew.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lk.weddingplanner.api.domain.MembershipRole;

public record UpdateCrewRequest(
        @NotNull MembershipRole role, @Size(max = 500) String responsibilities) {}
