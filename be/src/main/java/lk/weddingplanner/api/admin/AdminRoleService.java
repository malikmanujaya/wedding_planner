package lk.weddingplanner.api.admin;

import java.util.List;
import java.util.Locale;
import lk.weddingplanner.api.admin.dto.RoleResponse;
import lk.weddingplanner.api.admin.dto.UpsertRoleRequest;
import lk.weddingplanner.api.common.ApiException;
import lk.weddingplanner.api.common.PageRequestParams;
import lk.weddingplanner.api.common.PageResponse;
import lk.weddingplanner.api.domain.Role;
import lk.weddingplanner.api.domain.SystemRoles;
import lk.weddingplanner.api.repository.RoleRepository;
import lk.weddingplanner.api.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class AdminRoleService {

    private final RoleRepository roleRepository;

    @Transactional(readOnly = true)
    public PageResponse<RoleResponse> list(Integer page, Integer size) {
        List<RoleResponse> all =
                roleRepository.findAllByOrderBySystemRoleDescNameAsc().stream()
                        .map(this::toResponse)
                        .toList();
        return PageRequestParams.of(page, size).paginate(all);
    }

    @Transactional
    public RoleResponse create(UserPrincipal principal, UpsertRoleRequest request) {
        requireAdmin(principal);
        String code = generateUniqueCode(request.name());

        Role role = new Role();
        role.setCode(code);
        role.setName(request.name().trim());
        role.setDescription(trimToNull(request.description()));
        role.setSystemRole(false);
        role.setActive(request.active() == null || request.active());
        return toResponse(roleRepository.save(role));
    }

    @Transactional
    public RoleResponse update(UserPrincipal principal, Long id, UpsertRoleRequest request) {
        requireAdmin(principal);
        Role role =
                roleRepository
                        .findById(id)
                        .orElseThrow(() -> new ApiException("Role not found", HttpStatus.NOT_FOUND));

        role.setName(request.name().trim());
        role.setDescription(trimToNull(request.description()));
        if (request.active() != null) {
            if (SystemRoles.SUPER_ADMIN.equals(role.getCode()) && !request.active()) {
                throw new ApiException("SUPER_ADMIN cannot be deactivated", HttpStatus.BAD_REQUEST);
            }
            role.setActive(request.active());
        }
        // Code is immutable once assigned.
        return toResponse(roleRepository.save(role));
    }

    @Transactional
    public void delete(UserPrincipal principal, Long id) {
        requireAdmin(principal);
        Role role =
                roleRepository
                        .findById(id)
                        .orElseThrow(() -> new ApiException("Role not found", HttpStatus.NOT_FOUND));
        if (role.isSystemRole()) {
            throw new ApiException("System roles cannot be deleted", HttpStatus.BAD_REQUEST);
        }
        roleRepository.delete(role);
    }

    RoleResponse toResponse(Role role) {
        return new RoleResponse(
                role.getId(),
                role.getCode(),
                role.getName(),
                role.getDescription(),
                role.isSystemRole(),
                role.isActive());
    }

    private void requireAdmin(UserPrincipal principal) {
        if (!principal.hasRole(SystemRoles.SUPER_ADMIN) && !principal.hasRole(SystemRoles.ADMIN)) {
            throw new ApiException("Admin access required", HttpStatus.FORBIDDEN);
        }
    }

    private static boolean isReservedSystemCode(String code) {
        return SystemRoles.SUPER_ADMIN.equals(code)
                || SystemRoles.ADMIN.equals(code)
                || SystemRoles.USER.equals(code)
                || SystemRoles.VENDOR.equals(code);
    }

    /** Derive a unique UPPER_SNAKE code from the display name. */
    private String generateUniqueCode(String name) {
        String base =
                name.trim()
                        .toUpperCase(Locale.ROOT)
                        .replaceAll("[^A-Z0-9_]+", "_")
                        .replaceAll("_+", "_")
                        .replaceAll("^_+|_+$", "");
        if (base.length() > 50) {
            base = base.substring(0, 50).replaceAll("_+$", "");
        }
        if (!StringUtils.hasText(base)) {
            base = "CUSTOM";
        }
        if (isReservedSystemCode(base) || roleRepository.existsByCodeIgnoreCase(base)) {
            for (int i = 2; i < 10_000; i++) {
                String suffix = "_" + i;
                String stem =
                        base.length() + suffix.length() > 60
                                ? base.substring(0, 60 - suffix.length())
                                : base;
                String candidate = stem + suffix;
                if (!isReservedSystemCode(candidate)
                        && !roleRepository.existsByCodeIgnoreCase(candidate)) {
                    return candidate;
                }
            }
            throw new ApiException("Could not allocate a unique role code", HttpStatus.CONFLICT);
        }
        return base;
    }

    private static String trimToNull(String value) {
        if (!StringUtils.hasText(value)) return null;
        return value.trim();
    }
}
