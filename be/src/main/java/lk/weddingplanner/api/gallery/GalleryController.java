package lk.weddingplanner.api.gallery;

import jakarta.validation.Valid;
import java.util.List;
import lk.weddingplanner.api.gallery.dto.AddPhotoRequest;
import lk.weddingplanner.api.gallery.dto.GalleryAlbumResponse;
import lk.weddingplanner.api.gallery.dto.GalleryPhotoResponse;
import lk.weddingplanner.api.gallery.dto.UpsertAlbumRequest;
import lk.weddingplanner.api.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class GalleryController {

    private final GalleryService galleryService;

    @GetMapping("/api/public/weddings/{slug}/gallery")
    public List<GalleryAlbumResponse> publicGallery(@PathVariable String slug) {
        return galleryService.listPublicBySlug(slug);
    }

    @GetMapping("/api/weddings/{weddingId}/gallery/albums")
    public List<GalleryAlbumResponse> list(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable Long weddingId) {
        return galleryService.listForHost(principal, weddingId);
    }

    @PostMapping("/api/weddings/{weddingId}/gallery/albums")
    public GalleryAlbumResponse create(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long weddingId,
            @Valid @RequestBody UpsertAlbumRequest request) {
        return galleryService.createAlbum(principal, weddingId, request);
    }

    @PutMapping("/api/weddings/{weddingId}/gallery/albums/{albumId}")
    public GalleryAlbumResponse update(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long weddingId,
            @PathVariable Long albumId,
            @Valid @RequestBody UpsertAlbumRequest request) {
        return galleryService.updateAlbum(principal, weddingId, albumId, request);
    }

    @DeleteMapping("/api/weddings/{weddingId}/gallery/albums/{albumId}")
    public void deleteAlbum(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long weddingId,
            @PathVariable Long albumId) {
        galleryService.deleteAlbum(principal, weddingId, albumId);
    }

    @PostMapping("/api/weddings/{weddingId}/gallery/albums/{albumId}/photos")
    public GalleryPhotoResponse addPhoto(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long weddingId,
            @PathVariable Long albumId,
            @Valid @RequestBody AddPhotoRequest request) {
        return galleryService.addPhoto(principal, weddingId, albumId, request);
    }

    @DeleteMapping("/api/weddings/{weddingId}/gallery/photos/{photoId}")
    public void deletePhoto(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long weddingId,
            @PathVariable Long photoId) {
        galleryService.deletePhoto(principal, weddingId, photoId);
    }
}
