package lk.weddingplanner.api.repository;

import java.util.Optional;
import lk.weddingplanner.api.domain.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    @Modifying(clearAutomatically = true)
    @Query("delete from RefreshToken r where r.user.id = :userId")
    void deleteAllByUserId(Long userId);

    @Modifying(clearAutomatically = true)
    @Query("delete from RefreshToken r where r.expiresAt < :now")
    void deleteExpired(java.time.Instant now);
}
