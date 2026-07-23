package lk.weddingplanner.api.repository;

import java.util.List;
import java.util.Optional;
import lk.weddingplanner.api.domain.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCase(String code);

    List<Role> findAllByOrderBySystemRoleDescNameAsc();

    @Query(
            """
            select r from Role r
            where r.active = true
            order by r.systemRole desc, r.name asc
            """)
    List<Role> findAllActive();
}
