package lk.weddingplanner.api.auth;

import jakarta.validation.Valid;
import java.util.Map;
import lk.weddingplanner.api.auth.dto.AuthResponse;
import lk.weddingplanner.api.auth.dto.LoginRequest;
import lk.weddingplanner.api.auth.dto.MeResponse;
import lk.weddingplanner.api.auth.dto.RefreshRequest;
import lk.weddingplanner.api.auth.dto.RegisterRequest;
import lk.weddingplanner.api.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(@Valid @RequestBody RefreshRequest request) {
        return authService.refresh(request);
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody(required = false) Map<String, String> body) {
        String refreshToken = body != null ? body.get("refreshToken") : null;
        authService.logout(principal, refreshToken);
    }

    @GetMapping("/me")
    public MeResponse me(@AuthenticationPrincipal UserPrincipal principal) {
        return authService.me(principal);
    }
}
