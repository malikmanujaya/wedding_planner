package lk.weddingplanner.api.admin;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lk.weddingplanner.api.admin.dto.AdminUserResponse;
import lk.weddingplanner.api.admin.dto.CreateUserRequest;
import lk.weddingplanner.api.admin.dto.UpdateUserRequest;
import lk.weddingplanner.api.common.ApiException;
import lk.weddingplanner.api.common.PageRequestParams;
import lk.weddingplanner.api.common.PageResponse;
import lk.weddingplanner.api.domain.Role;
import lk.weddingplanner.api.domain.SystemRoles;
import lk.weddingplanner.api.domain.User;
import lk.weddingplanner.api.repository.RoleRepository;
import lk.weddingplanner.api.repository.UserRepository;
import lk.weddingplanner.api.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AdminRoleService adminRoleService;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public PageResponse<AdminUserResponse> list(UserPrincipal principal, Integer page, Integer size) {
        requireAdmin(principal);
        List<AdminUserResponse> all =
                userRepository.findAllWithRoles().stream().map(this::toResponse).toList();
        return PageRequestParams.of(page, size).paginate(all);
    }

    @Transactional(readOnly = true)
    public AdminUserResponse get(UserPrincipal principal, Long id) {
        requireAdmin(principal);
        return toResponse(requireUser(id));
    }

    @Transactional
    public AdminUserResponse create(UserPrincipal principal, CreateUserRequest request) {
        requireAdmin(principal);
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ApiException("Email already registered", HttpStatus.CONFLICT);
        }

        Set<Role> roles = resolveRoles(principal, request.roleCodes());
        User user = new User();
        user.setEmail(email);
        user.setFullName(request.fullName().trim());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRoles(roles);
        user.setActive(request.active() == null || request.active());
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public AdminUserResponse update(UserPrincipal principal, Long id, UpdateUserRequest request) {
        requireAdmin(principal);
        User user = requireUser(id);

        if (user.isSuperAdmin() && !principal.hasRole(SystemRoles.SUPER_ADMIN)) {
            throw new ApiException("Only SUPER_ADMIN can edit super admins", HttpStatus.FORBIDDEN);
        }
        if (user.getId().equals(principal.getId())
                && request.active() != null
                && !request.active()) {
            throw new ApiException("You cannot disable your own account", HttpStatus.BAD_REQUEST);
        }

        user.setFullName(request.fullName().trim());
        if (StringUtils.hasText(request.password())) {
            user.setPasswordHash(passwordEncoder.encode(request.password()));
        }
        user.setRoles(resolveRoles(principal, request.roleCodes()));
        if (request.active() != null) {
            user.setActive(request.active());
        }
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public void delete(UserPrincipal principal, Long id) {
        if (!principal.hasRole(SystemRoles.SUPER_ADMIN)) {
            throw new ApiException("Only SUPER_ADMIN can delete users", HttpStatus.FORBIDDEN);
        }
        User user = requireUser(id);
        if (user.getId().equals(principal.getId())) {
            throw new ApiException("You cannot delete your own account", HttpStatus.BAD_REQUEST);
        }
        if (user.isSuperAdmin()) {
            long otherSuper =
                    userRepository.findAllWithRoles().stream()
                            .filter(User::isSuperAdmin)
                            .filter(u -> !u.getId().equals(id))
                            .count();
            if (otherSuper < 1) {
                throw new ApiException("At least one SUPER_ADMIN must remain", HttpStatus.BAD_REQUEST);
            }
        }
        userRepository.delete(user);
    }

    private Set<Role> resolveRoles(UserPrincipal principal, List<String> roleCodes) {
        Set<Role> roles = new HashSet<>();
        for (String raw : roleCodes) {
            Role role =
                    roleRepository
                            .findByCodeIgnoreCase(raw.trim())
                            .orElseThrow(
                                    () ->
                                            new ApiException(
                                                    "Unknown role: " + raw, HttpStatus.BAD_REQUEST));
            if (!role.isActive()) {
                throw new ApiException("Role is inactive: " + role.getCode(), HttpStatus.BAD_REQUEST);
            }
            if (SystemRoles.SUPER_ADMIN.equals(role.getCode())
                    && !principal.hasRole(SystemRoles.SUPER_ADMIN)) {
                throw new ApiException(
                        "Only SUPER_ADMIN can assign SUPER_ADMIN", HttpStatus.FORBIDDEN);
            }
            roles.add(role);
        }
        if (roles.isEmpty()) {
            throw new ApiException("At least one role is required", HttpStatus.BAD_REQUEST);
        }
        return roles;
    }

    private User requireUser(Long id) {
        return userRepository
                .findByIdWithRoles(id)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
    }

    private void requireAdmin(UserPrincipal principal) {
        if (!principal.hasRole(SystemRoles.SUPER_ADMIN) && !principal.hasRole(SystemRoles.ADMIN)) {
            throw new ApiException("Admin access required", HttpStatus.FORBIDDEN);
        }
    }

    private AdminUserResponse toResponse(User user) {
        return new AdminUserResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.isActive(),
                user.getRoles().stream()
                        .map(adminRoleService::toResponse)
                        .collect(Collectors.toList()),
                user.getCreatedAt());
    }
}
