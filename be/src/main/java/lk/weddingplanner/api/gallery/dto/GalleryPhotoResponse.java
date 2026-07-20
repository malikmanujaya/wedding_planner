package lk.weddingplanner.api.gallery.dto;

public record GalleryPhotoResponse(
        Long id, Long albumId, String uploadId, String imageUrl, String caption, int sortOrder) {}
