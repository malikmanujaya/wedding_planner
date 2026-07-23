package lk.weddingplanner.api.guest;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.StringWriter;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import lk.weddingplanner.api.common.ApiException;
import lk.weddingplanner.api.common.PageRequestParams;
import lk.weddingplanner.api.common.PageResponse;
import lk.weddingplanner.api.domain.Guest;
import lk.weddingplanner.api.domain.RsvpStatus;
import lk.weddingplanner.api.domain.Wedding;
import lk.weddingplanner.api.guest.dto.GuestImportResult;
import lk.weddingplanner.api.guest.dto.GuestResponse;
import lk.weddingplanner.api.guest.dto.UpsertGuestRequest;
import lk.weddingplanner.api.invite.InviteService;
import lk.weddingplanner.api.repository.GuestRepository;
import lk.weddingplanner.api.security.UserPrincipal;
import lk.weddingplanner.api.wedding.WeddingAccessService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class GuestService {

    private final GuestRepository guestRepository;
    private final WeddingAccessService weddingAccessService;
    private final InviteService inviteService;

    @Transactional(readOnly = true)
    public PageResponse<GuestResponse> list(
            UserPrincipal principal, Long weddingId, String q, String rsvp, Integer page, Integer size) {
        weddingAccessService.requireMemberWedding(principal, weddingId);
        String query = q != null ? q.trim().toLowerCase(Locale.ROOT) : "";
        RsvpStatus statusFilter = parseStatusOrNull(rsvp);

        List<GuestResponse> all =
                guestRepository.findAllByWeddingId(weddingId).stream()
                        .filter(g -> statusFilter == null || g.getRsvpStatus() == statusFilter)
                        .filter(g -> query.isEmpty() || matchesQuery(g, query))
                        .map(this::toResponse)
                        .toList();
        return PageRequestParams.of(page, size).paginate(all);
    }

    @Transactional
    public GuestResponse create(UserPrincipal principal, Long weddingId, UpsertGuestRequest request) {
        Wedding wedding = weddingAccessService.requireMemberWedding(principal, weddingId);
        Guest guest = new Guest();
        guest.setWedding(wedding);
        apply(guest, request);
        inviteService.ensureToken(guest);
        return toResponse(guestRepository.save(guest));
    }

    @Transactional
    public GuestResponse update(
            UserPrincipal principal, Long weddingId, Long guestId, UpsertGuestRequest request) {
        weddingAccessService.requireMemberWedding(principal, weddingId);
        Guest guest =
                guestRepository
                        .findByIdAndWeddingId(guestId, weddingId)
                        .orElseThrow(() -> new ApiException("Guest not found", HttpStatus.NOT_FOUND));
        apply(guest, request);
        inviteService.ensureToken(guest);
        guest.setUpdatedAt(Instant.now());
        return toResponse(guestRepository.save(guest));
    }

    @Transactional
    public GuestResponse ensureInvite(
            UserPrincipal principal, Long weddingId, Long guestId) {
        weddingAccessService.requireMemberWedding(principal, weddingId);
        Guest guest =
                guestRepository
                        .findByIdAndWeddingId(guestId, weddingId)
                        .orElseThrow(() -> new ApiException("Guest not found", HttpStatus.NOT_FOUND));
        inviteService.ensureToken(guest);
        guest.setUpdatedAt(Instant.now());
        return toResponse(guestRepository.save(guest));
    }

    @Transactional
    public GuestResponse regenerateInvite(
            UserPrincipal principal, Long weddingId, Long guestId) {
        weddingAccessService.requireMemberWedding(principal, weddingId);
        Guest guest =
                guestRepository
                        .findByIdAndWeddingId(guestId, weddingId)
                        .orElseThrow(() -> new ApiException("Guest not found", HttpStatus.NOT_FOUND));
        inviteService.regenerateToken(guest);
        guest.setUpdatedAt(Instant.now());
        return toResponse(guestRepository.save(guest));
    }

    @Transactional
    public void delete(UserPrincipal principal, Long weddingId, Long guestId) {
        weddingAccessService.requireMemberWedding(principal, weddingId);
        Guest guest =
                guestRepository
                        .findByIdAndWeddingId(guestId, weddingId)
                        .orElseThrow(() -> new ApiException("Guest not found", HttpStatus.NOT_FOUND));
        guestRepository.delete(guest);
    }

    @Transactional
    public void bulkUpdateRsvp(
            UserPrincipal principal, Long weddingId, List<Long> guestIds, RsvpStatus status) {
        weddingAccessService.requireMemberWedding(principal, weddingId);
        for (Long guestId : guestIds) {
            guestRepository
                    .findByIdAndWeddingId(guestId, weddingId)
                    .ifPresent(
                            g -> {
                                g.setRsvpStatus(status);
                                g.setUpdatedAt(Instant.now());
                                guestRepository.save(g);
                            });
        }
    }

    @Transactional(readOnly = true)
    public String exportCsv(UserPrincipal principal, Long weddingId) {
        weddingAccessService.requireMemberWedding(principal, weddingId);
        StringWriter writer = new StringWriter();
        writer.write(
                "fullName,email,phone,household,mealPreference,rsvpStatus,tags,tableLabel,notes\n");
        for (Guest g : guestRepository.findAllByWeddingId(weddingId)) {
            writer.write(
                    String.join(
                            ",",
                            csv(g.getFullName()),
                            csv(g.getEmail()),
                            csv(g.getPhone()),
                            csv(g.getHousehold()),
                            csv(g.getMealPreference()),
                            csv(g.getRsvpStatus().name()),
                            csv(g.getTags()),
                            csv(g.getTableLabel()),
                            csv(g.getNotes())));
            writer.write("\n");
        }
        return writer.toString();
    }

    @Transactional
    public GuestImportResult importCsv(
            UserPrincipal principal, Long weddingId, MultipartFile file) {
        Wedding wedding = weddingAccessService.requireMemberWedding(principal, weddingId);
        if (file == null || file.isEmpty()) {
            throw new ApiException("CSV file is required", HttpStatus.BAD_REQUEST);
        }

        int imported = 0;
        int skipped = 0;
        List<Guest> batch = new ArrayList<>();

        try (BufferedReader reader =
                new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String line = reader.readLine();
            if (line == null) {
                return new GuestImportResult(0, 0, "Empty file");
            }
            // skip header if present
            if (!line.toLowerCase(Locale.ROOT).startsWith("fullname")) {
                Guest parsed = parseCsvLine(wedding, line);
                if (parsed != null) {
                    batch.add(parsed);
                    imported++;
                } else {
                    skipped++;
                }
            }

            while ((line = reader.readLine()) != null) {
                if (!StringUtils.hasText(line)) {
                    continue;
                }
                Guest parsed = parseCsvLine(wedding, line);
                if (parsed != null) {
                    batch.add(parsed);
                    imported++;
                } else {
                    skipped++;
                }
            }
        } catch (IOException ex) {
            throw new ApiException("Failed to read CSV", HttpStatus.BAD_REQUEST);
        }

        guestRepository.saveAll(batch);
        return new GuestImportResult(
                imported, skipped, "Imported " + imported + " guests (" + skipped + " skipped)");
    }

    private Guest parseCsvLine(Wedding wedding, String line) {
        String[] parts = splitCsv(line);
        if (parts.length < 1 || !StringUtils.hasText(parts[0])) {
            return null;
        }
        Guest guest = new Guest();
        guest.setWedding(wedding);
        guest.setFullName(parts[0].trim());
        guest.setEmail(valueAt(parts, 1));
        guest.setPhone(valueAt(parts, 2));
        guest.setHousehold(valueAt(parts, 3));
        guest.setMealPreference(valueAt(parts, 4));
        guest.setRsvpStatus(parseStatusOrDefault(valueAt(parts, 5)));
        guest.setTags(valueAt(parts, 6));
        guest.setTableLabel(valueAt(parts, 7));
        guest.setNotes(valueAt(parts, 8));
        inviteService.ensureToken(guest);
        return guest;
    }

    private void apply(Guest guest, UpsertGuestRequest request) {
        guest.setFullName(request.fullName().trim());
        guest.setEmail(blankToNull(request.email()));
        guest.setPhone(blankToNull(request.phone()));
        guest.setHousehold(blankToNull(request.household()));
        guest.setMealPreference(blankToNull(request.mealPreference()));
        guest.setRsvpStatus(request.rsvpStatus() != null ? request.rsvpStatus() : RsvpStatus.PENDING);
        guest.setTags(blankToNull(request.tags()));
        guest.setTableLabel(blankToNull(request.tableLabel()));
        guest.setNotes(blankToNull(request.notes()));
    }

    private GuestResponse toResponse(Guest guest) {
        return new GuestResponse(
                guest.getId(),
                guest.getWedding().getId(),
                guest.getFullName(),
                guest.getEmail(),
                guest.getPhone(),
                guest.getHousehold(),
                guest.getMealPreference(),
                guest.getRsvpStatus(),
                guest.getTags(),
                guest.getTableLabel(),
                guest.getNotes(),
                guest.getInviteToken(),
                guest.getAttendanceStatus(),
                guest.getCheckedInAt() != null ? guest.getCheckedInAt().toString() : null);
    }

    private boolean matchesQuery(Guest g, String query) {
        return contains(g.getFullName(), query)
                || contains(g.getEmail(), query)
                || contains(g.getPhone(), query)
                || contains(g.getHousehold(), query)
                || contains(g.getTags(), query)
                || contains(g.getTableLabel(), query);
    }

    private boolean contains(String value, String query) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(query);
    }

    private RsvpStatus parseStatusOrNull(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        try {
            return RsvpStatus.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private RsvpStatus parseStatusOrDefault(String value) {
        RsvpStatus parsed = parseStatusOrNull(value);
        return parsed != null ? parsed : RsvpStatus.PENDING;
    }

    private String blankToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private String csv(String value) {
        if (value == null) {
            return "";
        }
        String escaped = value.replace("\"", "\"\"");
        if (escaped.contains(",") || escaped.contains("\"") || escaped.contains("\n")) {
            return "\"" + escaped + "\"";
        }
        return escaped;
    }

    private String valueAt(String[] parts, int index) {
        if (index >= parts.length) {
            return null;
        }
        return blankToNull(parts[index]);
    }

    private String[] splitCsv(String line) {
        List<String> tokens = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '"') {
                if (inQuotes && i + 1 < line.length() && line.charAt(i + 1) == '"') {
                    current.append('"');
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (c == ',' && !inQuotes) {
                tokens.add(current.toString());
                current.setLength(0);
            } else {
                current.append(c);
            }
        }
        tokens.add(current.toString());
        return tokens.toArray(String[]::new);
    }
}
