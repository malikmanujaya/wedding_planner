package lk.weddingplanner.api.repository;

import java.util.Optional;
import lk.weddingplanner.api.domain.Upload;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UploadRepository extends JpaRepository<Upload, String> {

    Optional<Upload> findByIdAndWeddingId(String id, Long weddingId);
}
