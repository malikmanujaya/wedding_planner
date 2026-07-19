package lk.weddingplanner.api.repository;

import java.util.List;
import java.util.Optional;
import lk.weddingplanner.api.domain.VendorPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface VendorPaymentRepository extends JpaRepository<VendorPayment, Long> {

    @Query("""
            select p from VendorPayment p
            where p.vendor.id = :vendorId
            order by p.id asc
            """)
    List<VendorPayment> findAllByVendorId(Long vendorId);

    @Query("""
            select p from VendorPayment p
            join fetch p.vendor v
            where p.id = :paymentId and v.id = :vendorId and v.wedding.id = :weddingId
            """)
    Optional<VendorPayment> findByIdAndVendorAndWedding(
            Long paymentId, Long vendorId, Long weddingId);

    void deleteByVendor_Id(Long vendorId);
}
