package lk.weddingplanner.api.repository;

import java.util.Optional;
import lk.weddingplanner.api.domain.ThankYouCard;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ThankYouCardRepository extends JpaRepository<ThankYouCard, Long> {

    Optional<ThankYouCard> findByWeddingId(Long weddingId);
}
