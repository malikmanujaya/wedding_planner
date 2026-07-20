package lk.weddingplanner.api.gallery;

import java.time.Instant;
import java.util.List;
import lk.weddingplanner.api.common.ApiException;
import lk.weddingplanner.api.domain.GalleryAlbum;
import lk.weddingplanner.api.domain.GalleryPhoto;
import lk.weddingplanner.api.domain.Upload;
import lk.weddingplanner.api.domain.Wedding;
import lk.weddingplanner.api.gallery.dto.AddPhotoRequest;
import lk.weddingplanner.api.gallery.dto.GalleryAlbumResponse;
import lk.weddingplanner.api.gallery.dto.GalleryPhotoResponse;
import lk.weddingplanner.api.gallery.dto.UpsertAlbumRequest;
import lk.weddingplanner.api.repository.GalleryAlbumRepository;
import lk.weddingplanner.api.repository.GalleryPhotoRepository;
import lk.weddingplanner.api.repository.UploadRepository;
import lk.weddingplanner.api.repository.WeddingRepository;
import lk.weddingplanner.api.security.UserPrincipal;
import lk.weddingplanner.api.wedding.WeddingAccessService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class GalleryService {

    private static final int MAX_PHOTOS_PER_ALBUM = 60;

    private final GalleryAlbumRepository albumRepository;
    private final GalleryPhotoRepository photoRepository;
    private final UploadRepository uploadRepository;
    private final WeddingRepository weddingRepository;
    private final WeddingAccessService weddingAccessService;

    @Transactional(readOnly = true)
    public List<GalleryAlbumResponse> listForHost(UserPrincipal principal, Long weddingId) {
        weddingAccessService.requireMemberWedding(principal, weddingId);
        return albumRepository.findAllByWeddingId(weddingId).stream().map(this::toAlbum).toList();
    }

    @Transactional(readOnly = true)
    public List<GalleryAlbumResponse> listPublicBySlug(String slug) {
        Wedding wedding =
                weddingRepository
                        .findBySlug(slug.trim())
                        .orElseThrow(() -> new ApiException("Wedding not found", HttpStatus.NOT_FOUND));
        if (!wedding.isPublicEnabled()) {
            throw new ApiException("This wedding page is not published", HttpStatus.NOT_FOUND);
        }
        return albumRepository.findPublicByWeddingId(wedding.getId()).stream()
                .map(this::toAlbum)
                .toList();
    }

    @Transactional
    public GalleryAlbumResponse createAlbum(
            UserPrincipal principal, Long weddingId, UpsertAlbumRequest request) {
        Wedding wedding = weddingAccessService.requireMemberWedding(principal, weddingId);
        GalleryAlbum album = new GalleryAlbum();
        album.setWedding(wedding);
        applyAlbum(album, request);
        if (request.sortOrder() == null) {
            album.setSortOrder(albumRepository.findAllByWeddingId(weddingId).size());
        }
        album.setCreatedAt(Instant.now());
        albumRepository.save(album);
        return toAlbum(album);
    }

    @Transactional
    public GalleryAlbumResponse updateAlbum(
            UserPrincipal principal, Long weddingId, Long albumId, UpsertAlbumRequest request) {
        weddingAccessService.requireMemberWedding(principal, weddingId);
        GalleryAlbum album = requireAlbum(weddingId, albumId);
        applyAlbum(album, request);
        albumRepository.save(album);
        return toAlbum(album);
    }

    @Transactional
    public void deleteAlbum(UserPrincipal principal, Long weddingId, Long albumId) {
        weddingAccessService.requireMemberWedding(principal, weddingId);
        GalleryAlbum album = requireAlbum(weddingId, albumId);
        List<GalleryPhoto> photos = photoRepository.findAllByAlbumId(albumId);
        photoRepository.deleteAll(photos);
        albumRepository.delete(album);
    }

    @Transactional
    public GalleryPhotoResponse addPhoto(
            UserPrincipal principal, Long weddingId, Long albumId, AddPhotoRequest request) {
        weddingAccessService.requireMemberWedding(principal, weddingId);
        GalleryAlbum album = requireAlbum(weddingId, albumId);
        if (photoRepository.countByAlbumId(albumId) >= MAX_PHOTOS_PER_ALBUM) {
            throw new ApiException(
                    "Album is full (max " + MAX_PHOTOS_PER_ALBUM + " photos)", HttpStatus.BAD_REQUEST);
        }

        String imageUrl = request.imageUrl().trim();
        String uploadId = StringUtils.hasText(request.uploadId()) ? request.uploadId().trim() : null;
        if (uploadId != null) {
            Upload upload =
                    uploadRepository
                            .findById(uploadId)
                            .orElseThrow(() -> new ApiException("Upload not found", HttpStatus.NOT_FOUND));
            if (!upload.getWedding().getId().equals(weddingId)) {
                throw new ApiException("Upload not found", HttpStatus.NOT_FOUND);
            }
            imageUrl = "/api/public/files/" + upload.getId();
        }

        GalleryPhoto photo = new GalleryPhoto();
        photo.setAlbum(album);
        photo.setUploadId(uploadId);
        photo.setImageUrl(imageUrl);
        photo.setCaption(StringUtils.hasText(request.caption()) ? request.caption().trim() : null);
        photo.setSortOrder(
                request.sortOrder() != null
                        ? request.sortOrder()
                        : (int) photoRepository.countByAlbumId(albumId));
        photo.setCreatedAt(Instant.now());
        photoRepository.save(photo);
        return toPhoto(photo);
    }

    @Transactional
    public void deletePhoto(UserPrincipal principal, Long weddingId, Long photoId) {
        weddingAccessService.requireMemberWedding(principal, weddingId);
        GalleryPhoto photo =
                photoRepository
                        .findByIdAndWeddingId(photoId, weddingId)
                        .orElseThrow(() -> new ApiException("Photo not found", HttpStatus.NOT_FOUND));
        photoRepository.delete(photo);
    }

    private void applyAlbum(GalleryAlbum album, UpsertAlbumRequest request) {
        album.setTitle(request.title().trim());
        album.setDescription(
                StringUtils.hasText(request.description()) ? request.description().trim() : null);
        if (request.sortOrder() != null) {
            album.setSortOrder(request.sortOrder());
        }
        if (request.publicVisible() != null) {
            album.setPublicVisible(request.publicVisible());
        }
    }

    private GalleryAlbum requireAlbum(Long weddingId, Long albumId) {
        return albumRepository
                .findByIdAndWeddingId(albumId, weddingId)
                .orElseThrow(() -> new ApiException("Album not found", HttpStatus.NOT_FOUND));
    }

    private GalleryAlbumResponse toAlbum(GalleryAlbum album) {
        Long albumId = album.getId();
        List<GalleryPhotoResponse> photos =
                photoRepository.findAllByAlbumId(albumId).stream()
                        .map(p -> toPhoto(p, albumId))
                        .toList();
        return new GalleryAlbumResponse(
                albumId,
                album.getTitle(),
                album.getDescription(),
                album.getSortOrder(),
                album.isPublicVisible(),
                photos);
    }

    private GalleryPhotoResponse toPhoto(GalleryPhoto photo) {
        return toPhoto(photo, photo.getAlbum().getId());
    }

    private GalleryPhotoResponse toPhoto(GalleryPhoto photo, Long albumId) {
        return new GalleryPhotoResponse(
                photo.getId(),
                albumId,
                photo.getUploadId(),
                photo.getImageUrl(),
                photo.getCaption(),
                photo.getSortOrder());
    }
}
