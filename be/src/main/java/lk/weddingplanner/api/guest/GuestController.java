package lk.weddingplanner.api.guest;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import lk.weddingplanner.api.domain.RsvpStatus;
import lk.weddingplanner.api.guest.dto.GuestImportResult;
import lk.weddingplanner.api.guest.dto.GuestResponse;
import lk.weddingplanner.api.guest.dto.UpsertGuestRequest;
import lk.weddingplanner.api.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/weddings/{weddingId}/guests")
@RequiredArgsConstructor
public class GuestController {

    private final GuestService guestService;

    @GetMapping
    public List<GuestResponse> list(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long weddingId,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String rsvp) {
        return guestService.list(principal, weddingId, q, rsvp);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public GuestResponse create(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long weddingId,
            @Valid @RequestBody UpsertGuestRequest request) {
        return guestService.create(principal, weddingId, request);
    }

    @PutMapping("/{guestId}")
    public GuestResponse update(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long weddingId,
            @PathVariable Long guestId,
            @Valid @RequestBody UpsertGuestRequest request) {
        return guestService.update(principal, weddingId, guestId, request);
    }

    @DeleteMapping("/{guestId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long weddingId,
            @PathVariable Long guestId) {
        guestService.delete(principal, weddingId, guestId);
    }

    @PutMapping("/bulk-rsvp")
    public ResponseEntity<Void> bulkRsvp(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long weddingId,
            @RequestBody Map<String, Object> body) {
        @SuppressWarnings("unchecked")
        List<Number> ids = (List<Number>) body.get("guestIds");
        String status = String.valueOf(body.get("rsvpStatus"));
        if (ids == null || ids.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        List<Long> guestIds = ids.stream().map(Number::longValue).toList();
        guestService.bulkUpdateRsvp(
                principal, weddingId, guestIds, RsvpStatus.valueOf(status.toUpperCase()));
        return ResponseEntity.noContent().build();
    }

    @GetMapping(value = "/export", produces = "text/csv")
    public ResponseEntity<String> export(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable Long weddingId) {
        String csv = guestService.exportCsv(principal, weddingId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"guests.csv\"")
                .contentType(new MediaType("text", "csv"))
                .body(csv);
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public GuestImportResult importCsv(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long weddingId,
            @RequestParam("file") MultipartFile file) {
        return guestService.importCsv(principal, weddingId, file);
    }
}
