package lk.weddingplanner.api.upload;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import lk.weddingplanner.api.common.ApiException;
import lk.weddingplanner.api.domain.Upload;
import lk.weddingplanner.api.domain.Wedding;
import lk.weddingplanner.api.repository.UploadRepository;
import lk.weddingplanner.api.security.UserPrincipal;
import lk.weddingplanner.api.upload.dto.UploadResponse;
import lk.weddingplanner.api.wedding.WeddingAccessService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class UploadService {

    private static final Set<String> ALLOWED_TYPES =
            Set.of("image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif");

    private final UploadRepository uploadRepository;
    private final WeddingAccessService weddingAccessService;

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    private Path root;

    @PostConstruct
    void init() throws IOException {
        root = Path.of(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(root);
    }

    @Transactional
    public UploadResponse store(UserPrincipal principal, Long weddingId, MultipartFile file) {
        Wedding wedding = weddingAccessService.requireMemberWedding(principal, weddingId);
        if (file == null || file.isEmpty()) {
            throw new ApiException("File is required", HttpStatus.BAD_REQUEST);
        }

        String contentType = normalizeContentType(file.getContentType(), file.getOriginalFilename());
        if (!ALLOWED_TYPES.contains(contentType)) {
            throw new ApiException(
                    "Only JPEG, PNG, WebP, or GIF images are allowed", HttpStatus.BAD_REQUEST);
        }

        String original =
                StringUtils.hasText(file.getOriginalFilename())
                        ? file.getOriginalFilename().trim()
                        : "image";
        String ext = extensionFor(contentType, original);
        String id = UUID.randomUUID().toString();
        String storedFilename = id + ext;
        Path target = root.resolve(storedFilename).normalize();
        if (!target.startsWith(root)) {
            throw new ApiException("Invalid path", HttpStatus.BAD_REQUEST);
        }

        try (InputStream in = file.getInputStream()) {
            Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new ApiException("Could not store file", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        Upload upload = new Upload();
        upload.setId(id);
        upload.setWedding(wedding);
        upload.setOriginalFilename(original.length() > 255 ? original.substring(0, 255) : original);
        upload.setStoredFilename(storedFilename);
        upload.setContentType(contentType);
        upload.setSizeBytes(file.getSize());
        upload.setUploadedByUserId(principal.getId());
        upload.setCreatedAt(Instant.now());
        uploadRepository.save(upload);

        return toResponse(upload);
    }

    @Transactional(readOnly = true)
    public Resource loadAsResource(String id) {
        Upload upload =
                uploadRepository
                        .findById(id)
                        .orElseThrow(() -> new ApiException("File not found", HttpStatus.NOT_FOUND));
        try {
            Path path = root.resolve(upload.getStoredFilename()).normalize();
            if (!path.startsWith(root) || !Files.exists(path)) {
                throw new ApiException("File not found", HttpStatus.NOT_FOUND);
            }
            Resource resource = new UrlResource(path.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new ApiException("File not found", HttpStatus.NOT_FOUND);
            }
            return resource;
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            throw new ApiException("File not found", HttpStatus.NOT_FOUND);
        }
    }

    @Transactional(readOnly = true)
    public Upload require(String id) {
        return uploadRepository
                .findById(id)
                .orElseThrow(() -> new ApiException("File not found", HttpStatus.NOT_FOUND));
    }

    public UploadResponse toResponse(Upload upload) {
        return new UploadResponse(
                upload.getId(),
                "/api/public/files/" + upload.getId(),
                upload.getContentType(),
                upload.getSizeBytes(),
                upload.getOriginalFilename());
    }

    private static String normalizeContentType(String raw, String filename) {
        if (StringUtils.hasText(raw)) {
            String ct = raw.toLowerCase(Locale.ROOT).trim();
            if ("image/jpg".equals(ct)) {
                return "image/jpeg";
            }
            return ct;
        }
        String name = filename != null ? filename.toLowerCase(Locale.ROOT) : "";
        if (name.endsWith(".png")) return "image/png";
        if (name.endsWith(".webp")) return "image/webp";
        if (name.endsWith(".gif")) return "image/gif";
        if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
        return "application/octet-stream";
    }

    private static String extensionFor(String contentType, String original) {
        return switch (contentType) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> {
                String lower = original.toLowerCase(Locale.ROOT);
                if (lower.endsWith(".png")) yield ".png";
                if (lower.endsWith(".webp")) yield ".webp";
                if (lower.endsWith(".gif")) yield ".gif";
                yield ".jpg";
            }
        };
    }
}
