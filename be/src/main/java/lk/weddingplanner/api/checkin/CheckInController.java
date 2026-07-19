package lk.weddingplanner.api.checkin;

import jakarta.validation.Valid;
import java.util.List;
import lk.weddingplanner.api.checkin.dto.CheckInActionRequest;
import lk.weddingplanner.api.checkin.dto.CheckInGuestResponse;
import lk.weddingplanner.api.checkin.dto.CheckInStatsResponse;
import lk.weddingplanner.api.checkin.dto.SeatFinderRequest;
import lk.weddingplanner.api.checkin.dto.SeatFinderResponse;
import lk.weddingplanner.api.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class CheckInController {

    private final CheckInService checkInService;

    @PostMapping("/api/public/weddings/{slug}/seat-finder")
    public SeatFinderResponse seatFinder(
            @PathVariable String slug, @Valid @RequestBody SeatFinderRequest request) {
        return checkInService.findSeat(slug, request);
    }

    @GetMapping("/api/weddings/{weddingId}/check-in")
    public List<CheckInGuestResponse> lookup(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long weddingId,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String token) {
        return checkInService.lookup(principal, weddingId, q, token);
    }

    @GetMapping("/api/weddings/{weddingId}/check-in/stats")
    public CheckInStatsResponse stats(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable Long weddingId) {
        return checkInService.stats(principal, weddingId);
    }

    @PostMapping("/api/weddings/{weddingId}/check-in/{guestId}")
    public CheckInGuestResponse checkIn(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long weddingId,
            @PathVariable Long guestId,
            @Valid @RequestBody CheckInActionRequest request) {
        return checkInService.checkIn(principal, weddingId, guestId, request);
    }
}
