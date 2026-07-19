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

    @Query("""
            select g from Guest g
            where g.wedding.id = :weddingId
              and lower(g.fullName) = lower(:fullName)
            """)
    List<Guest> findByWeddingIdAndFullNameIgnoreCase(Long weddingId, String fullName);

    @Query("""
            select g from Guest g
            where g.wedding.id = :weddingId
              and lower(g.fullName) = lower(:fullName)
              and lower(g.email) = lower(:email)
            """)
    Optional<Guest> findByWeddingIdAndFullNameAndEmailIgnoreCase(
            Long weddingId, String fullName, String email);

    long countByWeddingIdAndRsvpStatus(Long weddingId, RsvpStatus rsvpStatus);
}
