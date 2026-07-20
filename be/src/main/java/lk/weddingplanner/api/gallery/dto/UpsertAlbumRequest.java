package lk.weddingplanner.api.gallery.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpsertAlbumRequest(
        @NotBlank @Size(max = 120) String title,
        @Size(max = 500) String description,
        Integer sortOrder,
        Boolean publicVisible) {}
