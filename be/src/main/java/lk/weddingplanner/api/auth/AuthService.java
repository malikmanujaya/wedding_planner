package lk.weddingplanner.api.auth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.Set;
import lk.weddingplanner.api.auth.dto.AuthResponse;
import lk.weddingplanner.api.auth.dto.LoginRequest;
import lk.weddingplanner.api.auth.dto.MeResponse;
import lk.weddingplanner.api.auth.dto.RefreshRequest;
import lk.weddingplanner.api.auth.dto.RegisterRequest;
import lk.weddingplanner.api.common.ApiException;
import lk.weddingplanner.api.domain.RefreshToken;
import lk.weddingplanner.api.domain.Role;
import lk.weddingplanner.api.domain.SystemRoles;
import lk.weddingplanner.api.domain.User;
import lk.weddingplanner.api.repository.RefreshTokenRepository;
import lk.weddingplanner.api.repository.RoleRepository;
import lk.weddingplanner.api.repository.UserRepository;
import lk.weddingplanner.api.security.JwtService;
import lk.weddingplanner.api.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new ApiException("Email already registered", HttpStatus.CONFLICT);
        }

        Role userRole =
                roleRepository
                        .findByCodeIgnoreCase(SystemRoles.USER)
                        .orElseThrow(
                                () ->
                                        new ApiException(
                                                "Default USER role is missing. Restart the API to seed roles.",
                                                HttpStatus.INTERNAL_SERVER_ERROR));

        User user = new User();
        user.setEmail(request.email().trim().toLowerCase());
        user.setFullName(request.fullName().trim());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRoles(Set.of(userRole));
        userRepository.save(user);

        return issueTokens(new UserPrincipal(user));
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email().trim().toLowerCase(), request.password()));

        User user =
                userRepository
                        .findByEmailIgnoreCaseWithRoles(request.email().trim())
                        .orElseThrow(
                                () -> new ApiException("Invalid credentials", HttpStatus.UNAUTHORIZED));

        if (!user.isActive()) {
            throw new ApiException("Account is disabled", HttpStatus.FORBIDDEN);
        }

        return issueTokens(new UserPrincipal(user));
    }

    @Transactional
    public AuthResponse refresh(RefreshRequest request) {
        String hash = hashToken(request.refreshToken());
        RefreshToken stored =
                refreshTokenRepository
                        .findByTokenHash(hash)
                        .orElseThrow(
                                () -> new ApiException("Invalid refresh token", HttpStatus.UNAUTHORIZED));

        if (stored.getExpiresAt().isBefore(Instant.now())) {
            refreshTokenRepository.delete(stored);
            throw new ApiException("Refresh token expired", HttpStatus.UNAUTHORIZED);
        }

        User user =
                userRepository
                        .findByIdWithRoles(stored.getUser().getId())
                        .orElseThrow(() -> new ApiException("User not found", HttpStatus.UNAUTHORIZED));
        if (!user.isActive()) {
            refreshTokenRepository.delete(stored);
            throw new ApiException("Account is disabled", HttpStatus.FORBIDDEN);
        }
        refreshTokenRepository.delete(stored);
        return issueTokens(new UserPrincipal(user));
    }

    @Transactional
    public void logout(UserPrincipal principal, String refreshToken) {
        if (refreshToken != null && !refreshToken.isBlank()) {
            refreshTokenRepository.findByTokenHash(hashToken(refreshToken)).ifPresent(refreshTokenRepository::delete);
        } else if (principal != null) {
            refreshTokenRepository.deleteAllByUserId(principal.getId());
        }
    }

    public MeResponse me(UserPrincipal principal) {
        return new MeResponse(
                principal.getId(),
                principal.getEmail(),
                principal.getFullName(),
                new ArrayList<>(principal.getRoleCodes()),
                principal.isActive());
    }

    private AuthResponse issueTokens(UserPrincipal principal) {
        String access = jwtService.generateAccessToken(principal);
        String refresh = createRefreshToken(principal.getId());
        return new AuthResponse(
                access,
                refresh,
                jwtService.getAccessExpirationMs() / 1000,
                principal.getId(),
                principal.getEmail(),
                principal.getFullName(),
                new ArrayList<>(principal.getRoleCodes()));
    }

    private String createRefreshToken(Long userId) {
        User user =
                userRepository
                        .findById(userId)
                        .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        String raw = HexFormat.of().formatHex(bytes);

        RefreshToken entity = new RefreshToken();
        entity.setUser(user);
        entity.setTokenHash(hashToken(raw));
        entity.setExpiresAt(Instant.now().plusMillis(refreshExpirationMs));
        refreshTokenRepository.save(entity);
        return raw;
    }

    private String hashToken(String raw) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashed);
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to hash refresh token", ex);
        }
    }
}
