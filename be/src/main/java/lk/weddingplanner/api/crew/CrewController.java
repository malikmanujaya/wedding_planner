package lk.weddingplanner.api.crew;

import jakarta.validation.Valid;
import java.util.List;
import lk.weddingplanner.api.crew.dto.InviteCrewRequest;
import lk.weddingplanner.api.crew.dto.InviteCrewResponse;
import lk.weddingplanner.api.crew.dto.UpdateCrewRequest;
import lk.weddingplanner.api.security.UserPrincipal;
import lk.weddingplanner.api.wedding.dto.WeddingMemberResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/weddings/{weddingId}/crew")
@RequiredArgsConstructor
public class CrewController {

    private final CrewService crewService;

    @GetMapping
    public List<WeddingMemberResponse> list(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable Long weddingId) {
        return crewService.list(principal, weddingId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public InviteCrewResponse invite(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long weddingId,
            @Valid @RequestBody InviteCrewRequest request) {
        return crewService.invite(principal, weddingId, request);
    }

    @PutMapping("/{membershipId}")
    public WeddingMemberResponse update(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long weddingId,
            @PathVariable Long membershipId,
            @Valid @RequestBody UpdateCrewRequest request) {
        return crewService.update(principal, weddingId, membershipId, request);
    }

    @DeleteMapping("/{membershipId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long weddingId,
            @PathVariable Long membershipId) {
        crewService.remove(principal, weddingId, membershipId);
    }
}
