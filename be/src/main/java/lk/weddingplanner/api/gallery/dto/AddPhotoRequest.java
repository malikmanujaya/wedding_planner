package lk.weddingplanner.api.gallery.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AddPhotoRequest(
        @Size(max = 36) String uploadId,
        @NotBlank @Size(max = 500) String imageUrl,
        @Size(max = 255) String caption,
        Integer sortOrder) {}
