package lk.weddingplanner.api.invite;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Optional;
import lk.weddingplanner.api.common.ApiException;
import lk.weddingplanner.api.domain.Guest;
import lk.weddingplanner.api.domain.RsvpStatus;
import lk.weddingplanner.api.domain.SeatingPlan;
import lk.weddingplanner.api.domain.Wedding;
import lk.weddingplanner.api.invite.dto.PublicInviteResponse;
import lk.weddingplanner.api.invite.dto.PublicRsvpRequest;
import lk.weddingplanner.api.repository.GuestRepository;
import lk.weddingplanner.api.repository.SeatingPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Service
@RequiredArgsConstructor
public class InviteService {

    private final GuestRepository guestRepository;
    private final SeatingPlanRepository seatingPlanRepository;
    private final ObjectMapper objectMapper;
    private final SecureRandom secureRandom = new SecureRandom();

    @Transactional(readOnly = true)
    public PublicInviteResponse getByToken(String token) {
        Guest guest = requireByToken(token);
        return toPublic(guest);
    }

    @Transactional
    public PublicInviteResponse rsvp(String token, PublicRsvpRequest request) {
        Guest guest = requireByToken(token);
        if (request.rsvpStatus() == null) {
            throw new ApiException("RSVP status is required", HttpStatus.BAD_REQUEST);
        }
        guest.setRsvpStatus(request.rsvpStatus());
        if (StringUtils.hasText(request.mealPreference())) {
            guest.setMealPreference(request.mealPreference().trim());
        }
        if (StringUtils.hasText(request.notes())) {
            guest.setNotes(request.notes().trim());
        }
        guest.setUpdatedAt(Instant.now());
        guestRepository.save(guest);
        return toPublic(guest);
    }

    public String ensureToken(Guest guest) {
        if (StringUtils.hasText(guest.getInviteToken())) {
            return guest.getInviteToken();
        }
        String token = newToken();
        guest.setInviteToken(token);
        return token;
    }

    public String regenerateToken(Guest guest) {
        String token = newToken();
        guest.setInviteToken(token);
        return token;
    }

    private Guest requireByToken(String token) {
        if (!StringUtils.hasText(token)) {
            throw new ApiException("Invitation not found", HttpStatus.NOT_FOUND);
        }
        return guestRepository
                .findByInviteToken(token.trim())
                .orElseThrow(() -> new ApiException("Invitation not found", HttpStatus.NOT_FOUND));
    }

    private PublicInviteResponse toPublic(Guest guest) {
        Wedding wedding = guest.getWedding();
        SeatInfo seat = findSeat(wedding.getId(), guest.getId());
        String tableLabel =
                seat.tableLabel() != null
                        ? seat.tableLabel()
                        : guest.getTableLabel();
        return new PublicInviteResponse(
                guest.getInviteToken(),
                wedding.getTitle(),
                wedding.getWeddingDate() != null ? wedding.getWeddingDate().toString() : null,
                wedding.getVenue(),
                guest.getFullName(),
                guest.getHousehold(),
                guest.getMealPreference(),
                guest.getRsvpStatus(),
                tableLabel,
                seat.seatLabel(),
                tableLabel != null && !tableLabel.isBlank(),
                guest.getAttendanceStatus(),
                guest.getCheckedInAt() != null ? guest.getCheckedInAt().toString() : null);
    }

    private SeatInfo findSeat(Long weddingId, Long guestId) {
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
                    if (seat.hasNonNull("guestId") && seat.get("guestId").asLong() == guestId) {
                        String seatLabel = "Seat " + index;
                        return new SeatInfo(label, seatLabel);
                    }
                }
            }
        } catch (Exception ignored) {
            return SeatInfo.empty();
        }
        return SeatInfo.empty();
    }

    private String newToken() {
        byte[] bytes = new byte[24];
        secureRandom.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    private record SeatInfo(String tableLabel, String seatLabel) {
        static SeatInfo empty() {
            return new SeatInfo(null, null);
        }
    }
}
