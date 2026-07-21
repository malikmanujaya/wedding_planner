package lk.weddingplanner.api.wedding;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;
import java.time.LocalDate;
import lk.weddingplanner.api.common.ApiException;
import lk.weddingplanner.api.domain.ChecklistTask;
import lk.weddingplanner.api.domain.MembershipRole;
import lk.weddingplanner.api.domain.User;
import lk.weddingplanner.api.domain.Wedding;
import lk.weddingplanner.api.domain.WeddingMembership;
import lk.weddingplanner.api.repository.ChecklistTaskRepository;
import lk.weddingplanner.api.repository.UserRepository;
import lk.weddingplanner.api.repository.WeddingMembershipRepository;
import lk.weddingplanner.api.repository.WeddingRepository;
import lk.weddingplanner.api.security.UserPrincipal;
import lk.weddingplanner.api.wedding.dto.CreateWeddingRequest;
import lk.weddingplanner.api.wedding.dto.WeddingMemberResponse;
import lk.weddingplanner.api.wedding.dto.WeddingResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class WeddingService {

    private static final Pattern NON_LATIN = Pattern.compile("[^\\w-]");

    /** Default checklist: task title + months before the wedding it should be done. */
    private static final String[][] DEFAULT_CHECKLIST = {
        {"Set your budget", "12"},
        {"Draft the guest list", "11"},
        {"Book the venue", "10"},
        {"Book the photographer", "9"},
        {"Book catering / menu tasting", "8"},
        {"Choose attire (bride & groom)", "6"},
        {"Send invitations", "3"},
        {"Book entertainment / DJ", "3"},
        {"Order the cake", "2"},
        {"Finalize the seating plan", "1"},
        {"Confirm all vendors", "1"},
        {"Collect RSVPs & final headcount", "1"},
    };

    private final WeddingRepository weddingRepository;
    private final WeddingMembershipRepository membershipRepository;
    private final UserRepository userRepository;
    private final ChecklistTaskRepository checklistTaskRepository;

    @Transactional
    public List<WeddingResponse> listMine(UserPrincipal principal) {
        return membershipRepository.findAllByUserIdWithWedding(principal.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public WeddingResponse create(UserPrincipal principal, CreateWeddingRequest request) {
        User user =
                userRepository
                        .findById(principal.getId())
                        .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        String slug = resolveSlug(request);
        if (weddingRepository.existsBySlug(slug)) {
            throw new ApiException("Slug already taken", HttpStatus.CONFLICT);
        }

        Wedding wedding = new Wedding();
        wedding.setTitle(request.title().trim());
        wedding.setSlug(slug);
        wedding.setWeddingDate(request.weddingDate());
        wedding.setVenue(request.venue() != null ? request.venue().trim() : null);
        wedding.setInviteCode(lk.weddingplanner.api.crew.CrewService.newInviteCode());
        weddingRepository.save(wedding);

        WeddingMembership membership = new WeddingMembership();
        membership.setWedding(wedding);
        membership.setUser(user);
        membership.setRole(MembershipRole.OWNER);
        membershipRepository.save(membership);

        seedChecklist(wedding);

        return toResponse(membership);
    }

    private void seedChecklist(Wedding wedding) {
        LocalDate weddingDate = wedding.getWeddingDate();
        for (String[] entry : DEFAULT_CHECKLIST) {
            ChecklistTask task = new ChecklistTask();
            task.setWedding(wedding);
            task.setTitle(entry[0]);
            if (weddingDate != null) {
                task.setDueDate(weddingDate.minusMonths(Long.parseLong(entry[1])));
            }
            checklistTaskRepository.save(task);
        }
    }

    @Transactional
    public WeddingResponse getForMember(UserPrincipal principal, Long weddingId) {
        WeddingMembership membership =
                membershipRepository
                        .findByWeddingIdAndUserId(weddingId, principal.getId())
                        .orElseThrow(() -> new ApiException("Wedding not found", HttpStatus.NOT_FOUND));
        return toResponse(membership);
    }

    @Transactional(readOnly = true)
    public List<WeddingMemberResponse> listMembers(UserPrincipal principal, Long weddingId) {
        membershipRepository
                .findByWeddingIdAndUserId(weddingId, principal.getId())
                .orElseThrow(() -> new ApiException("Wedding not found", HttpStatus.NOT_FOUND));

        return membershipRepository.findAllByWeddingIdWithUser(weddingId).stream()
                .map(
                        m ->
                                new WeddingMemberResponse(
                                        m.getId(),
                                        m.getUser().getId(),
                                        m.getUser().getFullName(),
                                        m.getUser().getEmail(),
                                        m.getRole().name(),
                                        m.getResponsibilities()))
                .toList();
    }

    private String resolveSlug(CreateWeddingRequest request) {
        String base =
                StringUtils.hasText(request.slug())
                        ? request.slug().trim()
                        : slugify(request.title());
        String slug = slugify(base);
        if (!StringUtils.hasText(slug)) {
            throw new ApiException("Could not derive a valid slug", HttpStatus.BAD_REQUEST);
        }
        return slug;
    }

    private String slugify(String input) {
        String normalized =
                Normalizer.normalize(input, Normalizer.Form.NFD)
                        .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        return NON_LATIN
                .matcher(normalized.toLowerCase(Locale.ROOT).trim().replace(' ', '-'))
                .replaceAll("")
                .replaceAll("-{2,}", "-")
                .replaceAll("^-|-$", "");
    }

    private WeddingResponse toResponse(WeddingMembership membership) {
        Wedding wedding = membership.getWedding();
        if (wedding.getInviteCode() == null || wedding.getInviteCode().isBlank()) {
            wedding.setInviteCode(lk.weddingplanner.api.crew.CrewService.newInviteCode());
            weddingRepository.save(wedding);
        }
        return new WeddingResponse(
                wedding.getId(),
                wedding.getTitle(),
                wedding.getSlug(),
                wedding.getWeddingDate(),
                wedding.getVenue(),
                wedding.getInviteCode(),
                membership.getRole().name());
    }
}
