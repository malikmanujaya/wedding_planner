package lk.weddingplanner.api.seating;

import java.time.Instant;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lk.weddingplanner.api.common.ApiException;
import lk.weddingplanner.api.domain.Guest;
import lk.weddingplanner.api.domain.SeatingPlan;
import lk.weddingplanner.api.domain.Wedding;
import lk.weddingplanner.api.repository.GuestRepository;
import lk.weddingplanner.api.repository.SeatingPlanRepository;
import lk.weddingplanner.api.seating.dto.SaveSeatingRequest;
import lk.weddingplanner.api.seating.dto.SeatingResponse;
import lk.weddingplanner.api.security.UserPrincipal;
import lk.weddingplanner.api.wedding.WeddingAccessService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;

@Service
@RequiredArgsConstructor
public class SeatingService {

    private static final String DEFAULT_PLAN =
            "{\"width\":1200,\"height\":800,\"tables\":[]}";

    private final SeatingPlanRepository seatingPlanRepository;
    private final GuestRepository guestRepository;
    private final WeddingAccessService weddingAccessService;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public SeatingResponse get(UserPrincipal principal, Long weddingId) {
        weddingAccessService.requireMemberWedding(principal, weddingId);
        return seatingPlanRepository
                .findByWeddingId(weddingId)
                .map(this::toResponse)
                .orElseGet(() -> new SeatingResponse(weddingId, defaultPlan(), 0));
    }

    @Transactional
    public SeatingResponse save(
            UserPrincipal principal, Long weddingId, SaveSeatingRequest request) {
        Wedding wedding = weddingAccessService.requireMemberWedding(principal, weddingId);
        JsonNode plan = request.plan();
        validatePlan(plan, weddingId);

        SeatingPlan entity =
                seatingPlanRepository.findByWeddingId(weddingId).orElseGet(SeatingPlan::new);

        if (entity.getId() != null && entity.getVersion() != request.version()) {
            throw new ApiException(
                    "Seating plan was updated elsewhere. Reload and try again.",
                    HttpStatus.CONFLICT);
        }
        if (entity.getId() == null && request.version() != 0) {
            throw new ApiException(
                    "Seating plan was updated elsewhere. Reload and try again.",
                    HttpStatus.CONFLICT);
        }

        try {
            entity.setWedding(wedding);
            entity.setPlanJson(objectMapper.writeValueAsString(plan));
            entity.setVersion(request.version() + 1);
            entity.setUpdatedAt(Instant.now());
            seatingPlanRepository.save(entity);
        } catch (ApiException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ApiException("Invalid seating plan JSON", HttpStatus.BAD_REQUEST);
        }

        syncGuestTableLabels(weddingId, plan);
        return toResponse(entity);
    }

    private void syncGuestTableLabels(Long weddingId, JsonNode plan) {
        Map<Long, String> assigned = new HashMap<>();
        JsonNode tables = plan.path("tables");
        if (tables.isArray()) {
            for (JsonNode table : tables) {
                String label = table.path("label").asString("");
                JsonNode seats = table.path("seats");
                if (!seats.isArray()) {
                    continue;
                }
                for (JsonNode seat : seats) {
                    if (seat.hasNonNull("guestId")) {
                        assigned.put(seat.get("guestId").asLong(), label);
                    }
                }
            }
        }

        List<Guest> guests = guestRepository.findAllByWeddingId(weddingId);
        for (Guest guest : guests) {
            if (assigned.containsKey(guest.getId())) {
                guest.setTableLabel(blankToNull(assigned.get(guest.getId())));
            } else if (guest.getTableLabel() != null) {
                guest.setTableLabel(null);
            }
        }
        guestRepository.saveAll(guests);
    }

    private void validatePlan(JsonNode plan, Long weddingId) {
        if (plan == null || !plan.isObject()) {
            throw new ApiException("Plan must be an object", HttpStatus.BAD_REQUEST);
        }
        JsonNode tables = plan.path("tables");
        if (!tables.isArray()) {
            throw new ApiException("Plan.tables must be an array", HttpStatus.BAD_REQUEST);
        }

        Set<Long> seenGuests = new HashSet<>();
        Set<Long> weddingGuestIds = new HashSet<>();
        guestRepository.findAllByWeddingId(weddingId).forEach(g -> weddingGuestIds.add(g.getId()));

        for (JsonNode table : tables) {
            int capacity = table.path("capacity").asInt(0);
            JsonNode seats = table.path("seats");
            int seatCount = seats.isArray() ? seats.size() : 0;
            if (capacity > 0 && seatCount > capacity) {
                throw new ApiException(
                        "Table \""
                                + table.path("label").asString("?")
                                + "\" exceeds capacity ("
                                + seatCount
                                + "/"
                                + capacity
                                + ")",
                        HttpStatus.BAD_REQUEST);
            }
            if (!seats.isArray()) {
                continue;
            }
            for (JsonNode seat : seats) {
                if (!seat.hasNonNull("guestId")) {
                    continue;
                }
                long guestId = seat.get("guestId").asLong();
                if (!weddingGuestIds.contains(guestId)) {
                    throw new ApiException(
                            "Guest " + guestId + " is not on this wedding",
                            HttpStatus.BAD_REQUEST);
                }
                if (!seenGuests.add(guestId)) {
                    throw new ApiException(
                            "Guest is assigned to more than one seat", HttpStatus.BAD_REQUEST);
                }
            }
        }
    }

    private SeatingResponse toResponse(SeatingPlan entity) {
        try {
            JsonNode plan = objectMapper.readTree(entity.getPlanJson());
            return new SeatingResponse(entity.getWedding().getId(), plan, entity.getVersion());
        } catch (Exception ex) {
            throw new ApiException("Stored seating plan is corrupt", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private JsonNode defaultPlan() {
        try {
            return objectMapper.readTree(DEFAULT_PLAN);
        } catch (Exception ex) {
            ObjectNode node = objectMapper.createObjectNode();
            node.put("width", 1200);
            node.put("height", 800);
            node.set("tables", objectMapper.createArrayNode());
            return node;
        }
    }

    private String blankToNull(String value) {
        return value != null && !value.isBlank() ? value.trim() : null;
    }
}
