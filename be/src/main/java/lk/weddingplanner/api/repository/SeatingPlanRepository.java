package lk.weddingplanner.api.repository;

import java.util.Optional;
import lk.weddingplanner.api.domain.SeatingPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface SeatingPlanRepository extends JpaRepository<SeatingPlan, Long> {

    @Query("""
            select s from SeatingPlan s
            join fetch s.wedding
            where s.wedding.id = :weddingId
            """)
    Optional<SeatingPlan> findByWeddingId(Long weddingId);
}
