package lk.weddingplanner.api.repository;

import java.util.List;
import lk.weddingplanner.api.domain.GiftClaim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface GiftClaimRepository extends JpaRepository<GiftClaim, Long> {

    @Query("""
            select c from GiftClaim c
            where c.giftItem.id = :giftItemId
            order by c.createdAt desc
            """)
    List<GiftClaim> findAllByGiftItemId(Long giftItemId);

    long countByGiftItemId(Long giftItemId);
}
