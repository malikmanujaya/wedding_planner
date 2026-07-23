package lk.weddingplanner.api.security;

import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lk.weddingplanner.api.domain.Role;
import lk.weddingplanner.api.domain.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Getter
public class UserPrincipal implements UserDetails {

    private final Long id;
    private final String email;
    private final String passwordHash;
    private final String fullName;
    private final boolean active;
    private final Set<String> roleCodes;
    private final Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.passwordHash = user.getPasswordHash();
        this.fullName = user.getFullName();
        this.active = user.isActive();
        this.roleCodes =
                user.getRoles().stream()
                        .filter(Role::isActive)
                        .map(Role::getCode)
                        .collect(Collectors.toSet());
        this.authorities =
                roleCodes.stream()
                        .map(code -> new SimpleGrantedAuthority("ROLE_" + code))
                        .toList();
    }

    public boolean hasRole(String code) {
        return roleCodes.contains(code);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return active;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return active;
    }
}
