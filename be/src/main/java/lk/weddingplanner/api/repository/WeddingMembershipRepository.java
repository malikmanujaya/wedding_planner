package lk.weddingplanner.api.repository;

import java.util.List;
import java.util.Optional;
import lk.weddingplanner.api.domain.WeddingMembership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface WeddingMembershipRepository extends JpaRepository<WeddingMembership, Long> {

    @Query("""
            select m from WeddingMembership m
            join fetch m.wedding
            where m.user.id = :userId
            order by m.createdAt desc
            """)
    List<WeddingMembership> findAllByUserIdWithWedding(Long userId);

    Optional<WeddingMembership> findByWeddingIdAndUserId(Long weddingId, Long userId);

    boolean existsByWeddingIdAndUserId(Long weddingId, Long userId);
}
