package lk.weddingplanner.api.repository;

import java.util.List;
import java.util.Optional;
import lk.weddingplanner.api.domain.CashFund;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface CashFundRepository extends JpaRepository<CashFund, Long> {

    @Query("""
            select f from CashFund f
            where f.wedding.id = :weddingId
            order by f.sortOrder asc, f.id asc
            """)
    List<CashFund> findAllByWeddingId(Long weddingId);

    @Query("""
            select f from CashFund f
            where f.wedding.id = :weddingId and f.publicVisible = true
            order by f.sortOrder asc, f.id asc
            """)
    List<CashFund> findPublicByWeddingId(Long weddingId);

    Optional<CashFund> findByIdAndWeddingId(Long id, Long weddingId);
}
