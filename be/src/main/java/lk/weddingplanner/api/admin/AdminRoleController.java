package lk.weddingplanner.api.admin;

import jakarta.validation.Valid;
import lk.weddingplanner.api.admin.dto.RoleResponse;
import lk.weddingplanner.api.admin.dto.UpsertRoleRequest;
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
@RequestMapping("/api/admin/roles")
@RequiredArgsConstructor
public class AdminRoleController {

    private final AdminRoleService adminRoleService;

    @GetMapping
    public PageResponse<RoleResponse> list(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        return adminRoleService.list(page, size);
    }

    @PostMapping
    public RoleResponse create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpsertRoleRequest request) {
        return adminRoleService.create(principal, request);
    }

    @PutMapping("/{id}")
    public RoleResponse update(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody UpsertRoleRequest request) {
        return adminRoleService.update(principal, id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        adminRoleService.delete(principal, id);
    }
}
