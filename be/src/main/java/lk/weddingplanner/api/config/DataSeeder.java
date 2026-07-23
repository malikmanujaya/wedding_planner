package lk.weddingplanner.api.config;

import java.util.List;
import java.util.Set;
import lk.weddingplanner.api.domain.Role;
import lk.weddingplanner.api.domain.SystemRoles;
import lk.weddingplanner.api.domain.User;
import lk.weddingplanner.api.repository.RoleRepository;
import lk.weddingplanner.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements ApplicationRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.superadmin.email:malikmanujayawijesuriya98@gmail.com}")
    private String superAdminEmail;

    @Value("${app.seed.superadmin.password:Malik98$}")
    private String superAdminPassword;

    @Value("${app.seed.superadmin.full-name:Super Admin}")
    private String superAdminName;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seedSystemRoles();
        seedSuperAdmin();
        backfillUsersWithoutRoles();
    }

    private void seedSystemRoles() {
        ensureRole(SystemRoles.SUPER_ADMIN, "Super Admin", "Full platform control including roles and admins", true);
        ensureRole(SystemRoles.ADMIN, "Admin", "Manage users and custom roles", true);
        ensureRole(SystemRoles.USER, "User", "Standard wedding planner account", true);
        ensureRole(SystemRoles.VENDOR, "Vendor", "Marketplace vendor account", true);
    }

    private void ensureRole(String code, String name, String description, boolean system) {
        roleRepository
                .findByCodeIgnoreCase(code)
                .orElseGet(
                        () -> {
                            Role role = new Role();
                            role.setCode(code);
                            role.setName(name);
                            role.setDescription(description);
                            role.setSystemRole(system);
                            role.setActive(true);
                            Role saved = roleRepository.save(role);
                            log.info("Seeded system role {}", code);
                            return saved;
                        });
    }

    private void seedSuperAdmin() {
        Role superRole =
                roleRepository
                        .findByCodeIgnoreCase(SystemRoles.SUPER_ADMIN)
                        .orElseThrow();

        String email = superAdminEmail.trim().toLowerCase();
        User user =
                userRepository
                        .findByEmailIgnoreCaseWithRoles(email)
                        .orElseGet(
                                () ->
                                        userRepository.findAllWithRoles().stream()
                                                .filter(u -> u.hasRole(SystemRoles.SUPER_ADMIN))
                                                .findFirst()
                                                .orElse(null));

        if (user != null) {
            user.setEmail(email);
            user.setFullName(superAdminName.trim());
            user.setPasswordHash(passwordEncoder.encode(superAdminPassword));
            user.setActive(true);
            if (!user.hasRole(SystemRoles.SUPER_ADMIN)) {
                user.getRoles().add(superRole);
            }
            userRepository.save(user);
            log.info("Synced SUPER_ADMIN account {}", email);
            return;
        }

        User created = new User();
        created.setEmail(email);
        created.setFullName(superAdminName.trim());
        created.setPasswordHash(passwordEncoder.encode(superAdminPassword));
        created.setRoles(Set.of(superRole));
        created.setActive(true);
        userRepository.save(created);
        log.info("Seeded SUPER_ADMIN account {}", email);
    }

    /** Existing H2 users created before role tables get USER if they have none. */
    private void backfillUsersWithoutRoles() {
        Role userRole = roleRepository.findByCodeIgnoreCase(SystemRoles.USER).orElse(null);
        if (userRole == null) return;

        List<User> users = userRepository.findAllWithRoles();
        for (User user : users) {
            if (user.getRoles() == null || user.getRoles().isEmpty()) {
                user.getRoles().add(userRole);
                userRepository.save(user);
                log.info("Backfilled USER role for {}", user.getEmail());
            }
        }
    }
}
