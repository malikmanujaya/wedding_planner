package lk.weddingplanner.api.upload;

import lk.weddingplanner.api.domain.Upload;
import lk.weddingplanner.api.security.UserPrincipal;
import lk.weddingplanner.api.upload.dto.UploadResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
public class UploadController {

    private final UploadService uploadService;

    @PostMapping("/api/weddings/{weddingId}/uploads")
    public UploadResponse upload(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long weddingId,
            @RequestParam("file") MultipartFile file) {
        return uploadService.store(principal, weddingId, file);
    }

    @GetMapping("/api/public/files/{id}")
    public ResponseEntity<Resource> getPublic(@PathVariable String id) {
        Upload meta = uploadService.require(id);
        Resource resource = uploadService.loadAsResource(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=31536000, immutable")
                .contentType(MediaType.parseMediaType(meta.getContentType()))
                .body(resource);
    }
}
