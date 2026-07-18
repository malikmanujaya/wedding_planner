package lk.weddingplanner.api.wedding.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record CreateWeddingRequest(
        @NotBlank @Size(min = 2, max = 160) String title,
        @Size(max = 80) String slug,
        LocalDate weddingDate,
        @Size(max = 255) String venue) {}
