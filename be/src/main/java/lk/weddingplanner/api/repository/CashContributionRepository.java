package lk.weddingplanner.api.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import lk.weddingplanner.api.domain.CashContribution;
import lk.weddingplanner.api.domain.ContributionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface CashContributionRepository extends JpaRepository<CashContribution, Long> {

    @Query("""
            select c from CashContribution c
            join fetch c.cashFund f
            where f.wedding.id = :weddingId
            order by c.createdAt desc
            """)
    List<CashContribution> findAllByWeddingId(Long weddingId);

    @Query("""
            select c from CashContribution c
            where c.cashFund.id = :fundId
            order by c.createdAt desc
            """)
    List<CashContribution> findAllByFundId(Long fundId);

    @Query("""
            select coalesce(sum(c.amount), 0) from CashContribution c
            where c.cashFund.id = :fundId and c.status = :status
            """)
    BigDecimal sumByFundIdAndStatus(Long fundId, ContributionStatus status);

    @Query("""
            select c from CashContribution c
            join fetch c.cashFund f
            where c.id = :id and f.wedding.id = :weddingId
            """)
    Optional<CashContribution> findByIdAndWeddingId(Long id, Long weddingId);
}
