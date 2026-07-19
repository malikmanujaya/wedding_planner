package lk.weddingplanner.api.crew.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lk.weddingplanner.api.domain.MembershipRole;

public record InviteCrewRequest(
        @NotBlank @Email String email,
        @Size(min = 2, max = 120) String fullName,
        @NotNull MembershipRole role,
        @Size(max = 500) String responsibilities) {}
