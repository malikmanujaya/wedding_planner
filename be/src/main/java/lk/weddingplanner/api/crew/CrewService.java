package lk.weddingplanner.api.crew;

import java.security.SecureRandom;
import java.util.EnumSet;
import java.util.List;
import java.util.UUID;
import lk.weddingplanner.api.common.ApiException;
import lk.weddingplanner.api.crew.dto.InviteCrewRequest;
import lk.weddingplanner.api.crew.dto.InviteCrewResponse;
import lk.weddingplanner.api.crew.dto.UpdateCrewRequest;
import lk.weddingplanner.api.domain.MembershipRole;
import lk.weddingplanner.api.domain.Role;
import lk.weddingplanner.api.domain.SystemRoles;
import lk.weddingplanner.api.domain.User;
import lk.weddingplanner.api.domain.Wedding;
import lk.weddingplanner.api.domain.WeddingMembership;
import lk.weddingplanner.api.repository.RoleRepository;
import lk.weddingplanner.api.repository.UserRepository;
import lk.weddingplanner.api.repository.WeddingMembershipRepository;
import lk.weddingplanner.api.security.UserPrincipal;
import lk.weddingplanner.api.wedding.WeddingAccessService;
import lk.weddingplanner.api.wedding.dto.WeddingMemberResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class CrewService {

    private static final EnumSet<MembershipRole> INVITABLE =
            EnumSet.of(MembershipRole.COUPLE, MembershipRole.CREW, MembershipRole.VENDOR);

    private static final SecureRandom RANDOM = new SecureRandom();

    private final WeddingAccessService weddingAccessService;
    private final WeddingMembershipRepository membershipRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<WeddingMemberResponse> list(UserPrincipal principal, Long weddingId) {
        weddingAccessService.requireMembership(principal, weddingId);
        return membershipRepository.findAllByWeddingIdWithUser(weddingId).stream()
                .map(this::toMember)
                .toList();
    }

    @Transactional
    public InviteCrewResponse invite(
            UserPrincipal principal, Long weddingId, InviteCrewRequest request) {
        requireManager(principal, weddingId);
        if (!INVITABLE.contains(request.role())) {
            throw new ApiException(
                    "Role must be COUPLE, CREW, or VENDOR", HttpStatus.BAD_REQUEST);
        }

        Wedding wedding = weddingAccessService.requireMemberWedding(principal, weddingId);
        String email = request.email().trim().toLowerCase();

        boolean createdNewUser = false;
        String tempPassword = null;
        User user = userRepository.findByEmailIgnoreCase(email).orElse(null);

        if (user == null) {
            if (!StringUtils.hasText(request.fullName())) {
                throw new ApiException(
                        "Full name is required for new crew members", HttpStatus.BAD_REQUEST);
            }
            tempPassword = generateTempPassword();
            user = new User();
            user.setEmail(email);
            user.setFullName(request.fullName().trim());
            user.setPasswordHash(passwordEncoder.encode(tempPassword));
            Role userRole =
                    roleRepository
                            .findByCodeIgnoreCase(SystemRoles.USER)
                            .orElseThrow(
                                    () ->
                                            new ApiException(
                                                    "Default USER role is missing",
                                                    HttpStatus.INTERNAL_SERVER_ERROR));
            user.getRoles().add(userRole);
            userRepository.save(user);
            createdNewUser = true;
        }

        if (membershipRepository.existsByWeddingIdAndUserId(weddingId, user.getId())) {
            throw new ApiException("User is already a member of this wedding", HttpStatus.CONFLICT);
        }

        WeddingMembership membership = new WeddingMembership();
        membership.setWedding(wedding);
        membership.setUser(user);
        membership.setRole(request.role());
        membership.setResponsibilities(
                StringUtils.hasText(request.responsibilities())
                        ? request.responsibilities().trim()
                        : null);
        membershipRepository.save(membership);

        return new InviteCrewResponse(toMember(membership), createdNewUser, tempPassword);
    }

    @Transactional
    public WeddingMemberResponse update(
            UserPrincipal principal, Long weddingId, Long membershipId, UpdateCrewRequest request) {
        requireManager(principal, weddingId);
        WeddingMembership membership = requireMembership(weddingId, membershipId);

        if (membership.getRole() == MembershipRole.OWNER && request.role() != MembershipRole.OWNER) {
            ensureAnotherOwner(weddingId, membershipId);
        }
        if (request.role() == MembershipRole.OWNER
                || INVITABLE.contains(request.role())
                || request.role() == MembershipRole.GUEST) {
            membership.setRole(request.role());
        } else {
            throw new ApiException("Invalid role", HttpStatus.BAD_REQUEST);
        }

        membership.setResponsibilities(
                StringUtils.hasText(request.responsibilities())
                        ? request.responsibilities().trim()
                        : null);
        return toMember(membershipRepository.save(membership));
    }

    @Transactional
    public void remove(UserPrincipal principal, Long weddingId, Long membershipId) {
        requireManager(principal, weddingId);
        WeddingMembership membership = requireMembership(weddingId, membershipId);

        if (membership.getUser().getId().equals(principal.getId())) {
            throw new ApiException("You cannot remove yourself", HttpStatus.BAD_REQUEST);
        }
        if (membership.getRole() == MembershipRole.OWNER) {
            ensureAnotherOwner(weddingId, membershipId);
        }
        membershipRepository.delete(membership);
    }

    private void requireManager(UserPrincipal principal, Long weddingId) {
        WeddingMembership me = weddingAccessService.requireMembership(principal, weddingId);
        if (me.getRole() != MembershipRole.OWNER && me.getRole() != MembershipRole.COUPLE) {
            throw new ApiException("Only owner or couple can manage crew", HttpStatus.FORBIDDEN);
        }
    }

    private WeddingMembership requireMembership(Long weddingId, Long membershipId) {
        return membershipRepository
                .findByIdWithUser(membershipId)
                .filter(m -> m.getWedding().getId().equals(weddingId))
                .orElseThrow(() -> new ApiException("Crew member not found", HttpStatus.NOT_FOUND));
    }

    private void ensureAnotherOwner(Long weddingId, Long excludingMembershipId) {
        long owners =
                membershipRepository.findAllByWeddingIdWithUser(weddingId).stream()
                        .filter(m -> m.getRole() == MembershipRole.OWNER)
                        .filter(m -> !m.getId().equals(excludingMembershipId))
                        .count();
        if (owners < 1) {
            throw new ApiException("Wedding must keep at least one owner", HttpStatus.BAD_REQUEST);
        }
    }

    private WeddingMemberResponse toMember(WeddingMembership membership) {
        User user = membership.getUser();
        return new WeddingMemberResponse(
                membership.getId(),
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                membership.getRole().name(),
                membership.getResponsibilities());
    }

    private String generateTempPassword() {
        String alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
        StringBuilder sb = new StringBuilder(10);
        for (int i = 0; i < 10; i++) {
            sb.append(alphabet.charAt(RANDOM.nextInt(alphabet.length())));
        }
        return sb.toString();
    }

    public static String newInviteCode() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    }
}
