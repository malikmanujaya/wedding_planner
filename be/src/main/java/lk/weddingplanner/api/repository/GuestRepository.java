package lk.weddingplanner.api.repository;

import java.util.List;
import java.util.Optional;
import lk.weddingplanner.api.domain.Guest;
import lk.weddingplanner.api.domain.RsvpStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface GuestRepository extends JpaRepository<Guest, Long> {

    @Query("""
            select g from Guest g
            where g.wedding.id = :weddingId
            order by g.fullName asc
            """)
    List<Guest> findAllByWeddingId(Long weddingId);

    @Query("""
            select g from Guest g
            where g.id = :id and g.wedding.id = :weddingId
            """)
    Optional<Guest> findByIdAndWeddingId(Long id, Long weddingId);

    Optional<Guest> findByInviteToken(String inviteToken);

    long countByWeddingIdAndRsvpStatus(Long weddingId, RsvpStatus rsvpStatus);
}
