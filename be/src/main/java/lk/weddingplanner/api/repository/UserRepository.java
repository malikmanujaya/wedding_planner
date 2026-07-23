package lk.weddingplanner.api.repository;

import java.util.List;
import java.util.Optional;
import lk.weddingplanner.api.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    @Query(
            """
            select distinct u from User u
            left join fetch u.roles
            where lower(u.email) = lower(:email)
            """)
    Optional<User> findByEmailIgnoreCaseWithRoles(String email);

    @Query(
            """
            select distinct u from User u
            left join fetch u.roles
            order by u.createdAt desc
            """)
    List<User> findAllWithRoles();

    @Query(
            """
            select distinct u from User u
            left join fetch u.roles
            where u.id = :id
            """)
    Optional<User> findByIdWithRoles(Long id);
}
