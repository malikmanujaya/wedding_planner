package lk.weddingplanner.api.invite;

import jakarta.validation.Valid;
import lk.weddingplanner.api.invite.dto.PublicInviteResponse;
import lk.weddingplanner.api.invite.dto.PublicRsvpRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/invites")
@RequiredArgsConstructor
public class PublicInviteController {

    private final InviteService inviteService;

    @GetMapping("/{token}")
    public PublicInviteResponse get(@PathVariable String token) {
        return inviteService.getByToken(token);
    }

    @PutMapping("/{token}/rsvp")
    public PublicInviteResponse rsvp(
            @PathVariable String token, @Valid @RequestBody PublicRsvpRequest request) {
        return inviteService.rsvp(token, request);
    }
}
