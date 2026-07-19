package lk.weddingplanner.api.wedding.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PublicRsvpLookupRequest(
        @NotBlank @Size(max = 120) String fullName,
        @Email @Size(max = 180) String email) {}
