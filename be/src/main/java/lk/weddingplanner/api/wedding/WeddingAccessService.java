package lk.weddingplanner.api.wedding;

import lk.weddingplanner.api.common.ApiException;
import lk.weddingplanner.api.domain.Wedding;
import lk.weddingplanner.api.domain.WeddingMembership;
import lk.weddingplanner.api.repository.WeddingMembershipRepository;
import lk.weddingplanner.api.repository.WeddingRepository;
import lk.weddingplanner.api.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WeddingAccessService {

    private final WeddingRepository weddingRepository;
    private final WeddingMembershipRepository membershipRepository;

    public Wedding requireMemberWedding(UserPrincipal principal, Long weddingId) {
        requireMembership(principal, weddingId);
        return weddingRepository
                .findById(weddingId)
                .orElseThrow(() -> new ApiException("Wedding not found", HttpStatus.NOT_FOUND));
    }

    public WeddingMembership requireMembership(UserPrincipal principal, Long weddingId) {
        return membershipRepository
                .findByWeddingIdAndUserId(weddingId, principal.getId())
                .orElseThrow(() -> new ApiException("Wedding not found", HttpStatus.NOT_FOUND));
    }
}
