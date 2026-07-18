package lk.weddingplanner.api.auth;

import lk.weddingplanner.api.auth.dto.AuthResponse;
import lk.weddingplanner.api.auth.dto.LoginRequest;
import lk.weddingplanner.api.auth.dto.MeResponse;
import lk.weddingplanner.api.auth.dto.RegisterRequest;
import lk.weddingplanner.api.common.ApiException;
import lk.weddingplanner.api.domain.GlobalRole;
import lk.weddingplanner.api.domain.User;
import lk.weddingplanner.api.repository.UserRepository;
import lk.weddingplanner.api.security.JwtService;
import lk.weddingplanner.api.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
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
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new ApiException("Email already registered", HttpStatus.CONFLICT);
        }

        User user = new User();
        user.setEmail(request.email().trim().toLowerCase());
        user.setFullName(request.fullName().trim());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setGlobalRole(GlobalRole.USER);
        userRepository.save(user);

        UserPrincipal principal = new UserPrincipal(user);
        return toAuthResponse(principal, jwtService.generateToken(principal));
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email().trim().toLowerCase(), request.password()));

        User user =
                userRepository
                        .findByEmailIgnoreCase(request.email().trim())
                        .orElseThrow(() -> new ApiException("Invalid credentials", HttpStatus.UNAUTHORIZED));

        UserPrincipal principal = new UserPrincipal(user);
        return toAuthResponse(principal, jwtService.generateToken(principal));
    }

    public MeResponse me(UserPrincipal principal) {
        return new MeResponse(
                principal.getId(),
                principal.getEmail(),
                principal.getFullName(),
                principal.getAuthorities().iterator().next().getAuthority().replace("ROLE_", ""));
    }

    private AuthResponse toAuthResponse(UserPrincipal principal, String token) {
        return new AuthResponse(token, principal.getId(), principal.getEmail(), principal.getFullName());
    }
}
