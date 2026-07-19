package lk.weddingplanner.api.repository;

import java.util.List;
import java.util.Optional;
import lk.weddingplanner.api.domain.VendorCategory;
import lk.weddingplanner.api.domain.WeddingVendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface WeddingVendorRepository extends JpaRepository<WeddingVendor, Long> {

    @Query("""
            select v from WeddingVendor v
            where v.wedding.id = :weddingId
            order by v.category asc, v.name asc
            """)
    List<WeddingVendor> findAllByWeddingId(Long weddingId);

    @Query("""
            select v from WeddingVendor v
            where v.id = :id and v.wedding.id = :weddingId
            """)
    Optional<WeddingVendor> findByIdAndWeddingId(Long id, Long weddingId);

    long countByWeddingIdAndCategory(Long weddingId, VendorCategory category);
}
