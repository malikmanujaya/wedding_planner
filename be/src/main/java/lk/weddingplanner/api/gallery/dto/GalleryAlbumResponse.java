package lk.weddingplanner.api.gallery.dto;

import java.util.List;

public record GalleryAlbumResponse(
        Long id,
        String title,
        String description,
        int sortOrder,
        boolean publicVisible,
        List<GalleryPhotoResponse> photos) {}
