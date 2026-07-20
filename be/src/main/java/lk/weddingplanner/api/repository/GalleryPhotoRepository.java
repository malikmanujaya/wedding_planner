package lk.weddingplanner.api.repository;

import java.util.List;
import java.util.Optional;
import lk.weddingplanner.api.domain.GalleryPhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface GalleryPhotoRepository extends JpaRepository<GalleryPhoto, Long> {

    @Query("""
            select p from GalleryPhoto p
            where p.album.id = :albumId
            order by p.sortOrder asc, p.id asc
            """)
    List<GalleryPhoto> findAllByAlbumId(Long albumId);

    @Query("""
            select p from GalleryPhoto p
            join fetch p.album a
            where p.id = :id and a.wedding.id = :weddingId
            """)
    Optional<GalleryPhoto> findByIdAndWeddingId(Long id, Long weddingId);

    long countByAlbumId(Long albumId);
}
