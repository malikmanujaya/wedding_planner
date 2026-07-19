package lk.weddingplanner.api.checkin;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import lk.weddingplanner.api.checkin.dto.CheckInActionRequest;
import lk.weddingplanner.api.checkin.dto.CheckInGuestResponse;
import lk.weddingplanner.api.checkin.dto.CheckInStatsResponse;
import lk.weddingplanner.api.checkin.dto.SeatFinderRequest;
import lk.weddingplanner.api.checkin.dto.SeatFinderResponse;
import lk.weddingplanner.api.common.ApiException;
import lk.weddingplanner.api.domain.AttendanceStatus;
import lk.weddingplanner.api.domain.Guest;
import lk.weddingplanner.api.domain.SeatingPlan;
import lk.weddingplanner.api.domain.Wedding;
import lk.weddingplanner.api.repository.GuestRepository;
import lk.weddingplanner.api.repository.SeatingPlanRepository;
import lk.weddingplanner.api.repository.WeddingRepository;
import lk.weddingplanner.api.security.UserPrincipal;
import lk.weddingplanner.api.wedding.WeddingAccessService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Service
@RequiredArgsConstructor
public class CheckInService {

    private final GuestRepository guestRepository;
    private final WeddingRepository weddingRepository;
    private final SeatingPlanRepository seatingPlanRepository;
    private final WeddingAccessService weddingAccessService;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public SeatFinderResponse findSeat(String weddingSlug, SeatFinderRequest request) {
        Wedding wedding =
                weddingRepository
                        .findBySlug(weddingSlug.trim())
                        .orElseThrow(() -> new ApiException("Wedding not found", HttpStatus.NOT_FOUND));

        String nameQuery = request.guestName().trim().toLowerCase(Locale.ROOT);
        String tableQuery = normalizeTable(request.tableLabel());

        List<Guest> matches =
                guestRepository.findAllByWeddingId(wedding.getId()).stream()
                        .filter(g -> g.getFullName().toLowerCase(Locale.ROOT).contains(nameQuery))
                        .toList();

        if (matches.isEmpty()) {
            return new SeatFinderResponse(
                    false,
                    "No guest matched that name. Check spelling with the hosts.",
                    null,
                    null,
                    null,
                    null,
                    null);
        }

        for (Guest guest : matches) {
            SeatInfo seat = resolveSeat(wedding.getId(), guest);
            String table = seat.tableLabel() != null ? seat.tableLabel() : guest.getTableLabel();
            if (table != null && normalizeTable(table).equals(tableQuery)) {
                return new SeatFinderResponse(
                        true,
                        "Seat confirmed",
                        guest.getFullName(),
                        table,
                        seat.seatLabel(),
                        guest.getRsvpStatus(),
                        guest.getAttendanceStatus());
            }
        }

        return new SeatFinderResponse(
                false,
                "Name found, but that table does not match this guest.",
                matches.get(0).getFullName(),
                null,
                null,
                matches.get(0).getRsvpStatus(),
                matches.get(0).getAttendanceStatus());
    }

    @Transactional(readOnly = true)
    public List<CheckInGuestResponse> lookup(
            UserPrincipal principal, Long weddingId, String q, String token) {
        weddingAccessService.requireMemberWedding(principal, weddingId);

        if (StringUtils.hasText(token)) {
            String cleaned = extractToken(token.trim());
            return guestRepository
                    .findByInviteToken(cleaned)
                    .filter(g -> g.getWedding().getId().equals(weddingId))
                    .map(g -> List.of(toCheckIn(g)))
                    .orElse(List.of());
        }

        String query = q != null ? q.trim().toLowerCase(Locale.ROOT) : "";
        return guestRepository.findAllByWeddingId(weddingId).stream()
                .filter(
                        g ->
                                query.isEmpty()
                                        || g.getFullName().toLowerCase(Locale.ROOT).contains(query)
                                        || (g.getHousehold() != null
                                                && g.getHousehold()
                                                        .toLowerCase(Locale.ROOT)
                                                        .contains(query))
                                        || (g.getTableLabel() != null
                                                && g.getTableLabel()
                                                        .toLowerCase(Locale.ROOT)
                                                        .contains(query)))
                .limit(30)
                .map(this::toCheckIn)
                .toList();
    }

    @Transactional
    public CheckInGuestResponse checkIn(
            UserPrincipal principal, Long weddingId, Long guestId, CheckInActionRequest request) {
        weddingAccessService.requireMemberWedding(principal, weddingId);
        Guest guest =
                guestRepository
                        .findByIdAndWeddingId(guestId, weddingId)
                        .orElseThrow(() -> new ApiException("Guest not found", HttpStatus.NOT_FOUND));

        AttendanceStatus action = request.action();
        if (action == null) {
            throw new ApiException("Action is required", HttpStatus.BAD_REQUEST);
        }
        guest.setAttendanceStatus(action);
        if (action == AttendanceStatus.ADMITTED || action == AttendanceStatus.REJECTED) {
            guest.setCheckedInAt(Instant.now());
        } else {
            guest.setCheckedInAt(null);
        }
        guest.setUpdatedAt(Instant.now());
        guestRepository.save(guest);
        return toCheckIn(guest);
    }

    @Transactional(readOnly = true)
    public CheckInStatsResponse stats(UserPrincipal principal, Long weddingId) {
        weddingAccessService.requireMemberWedding(principal, weddingId);
        List<Guest> guests = guestRepository.findAllByWeddingId(weddingId);
        long admitted =
                guests.stream().filter(g -> g.getAttendanceStatus() == AttendanceStatus.ADMITTED).count();
        long rejected =
                guests.stream().filter(g -> g.getAttendanceStatus() == AttendanceStatus.REJECTED).count();
        long notArrived = guests.size() - admitted - rejected;
        return new CheckInStatsResponse(guests.size(), admitted, rejected, notArrived);
    }

    private CheckInGuestResponse toCheckIn(Guest guest) {
        SeatInfo seat = resolveSeat(guest.getWedding().getId(), guest);
        String table =
                seat.tableLabel() != null ? seat.tableLabel() : guest.getTableLabel();
        return new CheckInGuestResponse(
                guest.getId(),
                guest.getFullName(),
                guest.getHousehold(),
                guest.getRsvpStatus(),
                table,
                seat.seatLabel(),
                guest.getInviteToken(),
                guest.getAttendanceStatus(),
                guest.getCheckedInAt() != null ? guest.getCheckedInAt().toString() : null);
    }

    private SeatInfo resolveSeat(Long weddingId, Guest guest) {
        Optional<SeatingPlan> planOpt = seatingPlanRepository.findByWeddingId(weddingId);
        if (planOpt.isEmpty()) {
            return SeatInfo.empty();
        }
        try {
            JsonNode root = objectMapper.readTree(planOpt.get().getPlanJson());
            JsonNode tables = root.path("tables");
            if (!tables.isArray()) {
                return SeatInfo.empty();
            }
            for (JsonNode table : tables) {
                String label = table.path("label").asString(null);
                JsonNode seats = table.path("seats");
                if (!seats.isArray()) {
                    continue;
                }
                int index = 0;
                for (JsonNode seat : seats) {
                    index++;
                    if (seat.hasNonNull("guestId") && seat.get("guestId").asLong() == guest.getId()) {
                        return new SeatInfo(label, "Seat " + index);
                    }
                }
            }
        } catch (Exception ignored) {
            return SeatInfo.empty();
        }
        return SeatInfo.empty();
    }

    private String extractToken(String raw) {
        int idx = raw.lastIndexOf('/');
        if (idx >= 0 && idx < raw.length() - 1) {
            return raw.substring(idx + 1).trim();
        }
        return raw.trim();
    }

    private String normalizeTable(String value) {
        return value.trim().toLowerCase(Locale.ROOT).replaceAll("\\s+", " ");
    }

    private record SeatInfo(String tableLabel, String seatLabel) {
        static SeatInfo empty() {
            return new SeatInfo(null, null);
        }
    }
}
