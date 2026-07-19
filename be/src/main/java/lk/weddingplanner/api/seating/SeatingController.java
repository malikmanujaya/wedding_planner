package lk.weddingplanner.api.seating;

import jakarta.validation.Valid;
import lk.weddingplanner.api.seating.dto.SaveSeatingRequest;
import lk.weddingplanner.api.seating.dto.SeatingResponse;
import lk.weddingplanner.api.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/weddings/{weddingId}/seating")
@RequiredArgsConstructor
public class SeatingController {

    private final SeatingService seatingService;

    @GetMapping
    public SeatingResponse get(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable Long weddingId) {
        return seatingService.get(principal, weddingId);
    }

    @PutMapping
    public SeatingResponse save(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long weddingId,
            @Valid @RequestBody SaveSeatingRequest request) {
        return seatingService.save(principal, weddingId, request);
    }
}
