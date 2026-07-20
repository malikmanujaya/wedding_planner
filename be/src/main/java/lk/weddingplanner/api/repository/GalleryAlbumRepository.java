package lk.weddingplanner.api.repository;

import java.util.List;
import java.util.Optional;
import lk.weddingplanner.api.domain.GalleryAlbum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface GalleryAlbumRepository extends JpaRepository<GalleryAlbum, Long> {

    @Query("""
            select a from GalleryAlbum a
            where a.wedding.id = :weddingId
            order by a.sortOrder asc, a.id asc
            """)
    List<GalleryAlbum> findAllByWeddingId(Long weddingId);

    @Query("""
            select a from GalleryAlbum a
            where a.wedding.id = :weddingId and a.publicVisible = true
            order by a.sortOrder asc, a.id asc
            """)
    List<GalleryAlbum> findPublicByWeddingId(Long weddingId);

    Optional<GalleryAlbum> findByIdAndWeddingId(Long id, Long weddingId);
}
