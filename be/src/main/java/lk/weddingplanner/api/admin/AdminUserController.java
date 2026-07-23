package lk.weddingplanner.api.admin;

import jakarta.validation.Valid;
import lk.weddingplanner.api.admin.dto.AdminUserResponse;
import lk.weddingplanner.api.admin.dto.CreateUserRequest;
import lk.weddingplanner.api.admin.dto.UpdateUserRequest;
import lk.weddingplanner.api.common.PageResponse;
import lk.weddingplanner.api.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public PageResponse<AdminUserResponse> list(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        return adminUserService.list(principal, page, size);
    }

    @GetMapping("/{id}")
    public AdminUserResponse get(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        return adminUserService.get(principal, id);
    }

    @PostMapping
    public AdminUserResponse create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateUserRequest request) {
        return adminUserService.create(principal, request);
    }

    @PutMapping("/{id}")
    public AdminUserResponse update(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request) {
        return adminUserService.update(principal, id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        adminUserService.delete(principal, id);
    }
}
