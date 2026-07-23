package lk.weddingplanner.api.task;

import java.time.Instant;
import java.util.List;
import lk.weddingplanner.api.common.ApiException;
import lk.weddingplanner.api.common.PageRequestParams;
import lk.weddingplanner.api.common.PageResponse;
import lk.weddingplanner.api.domain.ChecklistTask;
import lk.weddingplanner.api.domain.TaskStatus;
import lk.weddingplanner.api.domain.User;
import lk.weddingplanner.api.domain.Wedding;
import lk.weddingplanner.api.repository.ChecklistTaskRepository;
import lk.weddingplanner.api.repository.UserRepository;
import lk.weddingplanner.api.repository.WeddingMembershipRepository;
import lk.weddingplanner.api.security.UserPrincipal;
import lk.weddingplanner.api.task.dto.TaskResponse;
import lk.weddingplanner.api.task.dto.UpsertTaskRequest;
import lk.weddingplanner.api.wedding.WeddingAccessService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final ChecklistTaskRepository taskRepository;
    private final WeddingAccessService weddingAccessService;
    private final WeddingMembershipRepository membershipRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public PageResponse<TaskResponse> list(
            UserPrincipal principal, Long weddingId, Integer page, Integer size) {
        weddingAccessService.requireMemberWedding(principal, weddingId);
        List<TaskResponse> all =
                taskRepository.findAllByWeddingId(weddingId).stream().map(this::toResponse).toList();
        return PageRequestParams.of(page, size).paginate(all);
    }

    @Transactional
    public TaskResponse create(UserPrincipal principal, Long weddingId, UpsertTaskRequest request) {
        Wedding wedding = weddingAccessService.requireMemberWedding(principal, weddingId);
        ChecklistTask task = new ChecklistTask();
        task.setWedding(wedding);
        apply(task, request, weddingId);
        return toResponse(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse update(
            UserPrincipal principal, Long weddingId, Long taskId, UpsertTaskRequest request) {
        weddingAccessService.requireMemberWedding(principal, weddingId);
        ChecklistTask task =
                taskRepository
                        .findByIdAndWeddingId(taskId, weddingId)
                        .orElseThrow(() -> new ApiException("Task not found", HttpStatus.NOT_FOUND));
        apply(task, request, weddingId);
        task.setUpdatedAt(Instant.now());
        return toResponse(taskRepository.save(task));
    }

    @Transactional
    public void delete(UserPrincipal principal, Long weddingId, Long taskId) {
        weddingAccessService.requireMemberWedding(principal, weddingId);
        ChecklistTask task =
                taskRepository
                        .findByIdAndWeddingId(taskId, weddingId)
                        .orElseThrow(() -> new ApiException("Task not found", HttpStatus.NOT_FOUND));
        taskRepository.delete(task);
    }

    private void apply(ChecklistTask task, UpsertTaskRequest request, Long weddingId) {
        task.setTitle(request.title().trim());
        task.setNotes(StringUtils.hasText(request.notes()) ? request.notes().trim() : null);
        task.setStatus(request.status() != null ? request.status() : TaskStatus.TODO);
        task.setDueDate(request.dueDate());

        if (request.assigneeUserId() == null) {
            task.setAssignee(null);
            return;
        }

        boolean member =
                membershipRepository.existsByWeddingIdAndUserId(weddingId, request.assigneeUserId());
        if (!member) {
            throw new ApiException("Assignee must be a wedding member", HttpStatus.BAD_REQUEST);
        }
        User assignee =
                userRepository
                        .findById(request.assigneeUserId())
                        .orElseThrow(() -> new ApiException("Assignee not found", HttpStatus.NOT_FOUND));
        task.setAssignee(assignee);
    }

    private TaskResponse toResponse(ChecklistTask task) {
        User assignee = task.getAssignee();
        return new TaskResponse(
                task.getId(),
                task.getWedding().getId(),
                task.getTitle(),
                task.getNotes(),
                task.getStatus(),
                task.getDueDate(),
                assignee != null ? assignee.getId() : null,
                assignee != null ? assignee.getFullName() : null);
    }
}
