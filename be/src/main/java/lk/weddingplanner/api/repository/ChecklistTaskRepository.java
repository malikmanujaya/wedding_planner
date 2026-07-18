package lk.weddingplanner.api.repository;

import java.util.List;
import java.util.Optional;
import lk.weddingplanner.api.domain.ChecklistTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ChecklistTaskRepository extends JpaRepository<ChecklistTask, Long> {

    @Query("""
            select t from ChecklistTask t
            left join fetch t.assignee
            where t.wedding.id = :weddingId
            order by t.createdAt desc
            """)
    List<ChecklistTask> findAllByWeddingId(Long weddingId);

    @Query("""
            select t from ChecklistTask t
            left join fetch t.assignee
            where t.id = :taskId and t.wedding.id = :weddingId
            """)
    Optional<ChecklistTask> findByIdAndWeddingId(Long taskId, Long weddingId);
}
