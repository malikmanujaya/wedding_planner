package lk.weddingplanner.api.wedding;

import jakarta.validation.Valid;
import java.util.List;
import lk.weddingplanner.api.security.UserPrincipal;
import lk.weddingplanner.api.wedding.dto.CreateWeddingRequest;
import lk.weddingplanner.api.wedding.dto.WeddingMemberResponse;
import lk.weddingplanner.api.wedding.dto.WeddingResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/weddings")
@RequiredArgsConstructor
public class WeddingController {

    private final WeddingService weddingService;

    @GetMapping
    public List<WeddingResponse> list(@AuthenticationPrincipal UserPrincipal principal) {
        return weddingService.listMine(principal);
    }

    @PostMapping
    public WeddingResponse create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateWeddingRequest request) {
        return weddingService.create(principal, request);
    }

    @GetMapping("/{id}")
    public WeddingResponse get(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        return weddingService.getForMember(principal, id);
    }

    @GetMapping("/{id}/members")
    public List<WeddingMemberResponse> members(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        return weddingService.listMembers(principal, id);
    }
}
