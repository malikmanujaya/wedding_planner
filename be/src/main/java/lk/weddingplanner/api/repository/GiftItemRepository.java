package lk.weddingplanner.api.repository;

import java.util.List;
import java.util.Optional;
import lk.weddingplanner.api.domain.GiftItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface GiftItemRepository extends JpaRepository<GiftItem, Long> {

    @Query("""
            select g from GiftItem g
            where g.wedding.id = :weddingId
            order by g.sortOrder asc, g.id asc
            """)
    List<GiftItem> findAllByWeddingId(Long weddingId);

    @Query("""
            select g from GiftItem g
            where g.wedding.id = :weddingId and g.publicVisible = true
            order by g.sortOrder asc, g.id asc
            """)
    List<GiftItem> findPublicByWeddingId(Long weddingId);

    Optional<GiftItem> findByIdAndWeddingId(Long id, Long weddingId);
}
