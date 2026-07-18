package lk.weddingplanner.api.repository;

import java.util.Optional;
import lk.weddingplanner.api.domain.Wedding;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WeddingRepository extends JpaRepository<Wedding, Long> {
    Optional<Wedding> findBySlug(String slug);

    boolean existsBySlug(String slug);
}
