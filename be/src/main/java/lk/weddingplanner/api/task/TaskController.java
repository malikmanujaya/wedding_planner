package lk.weddingplanner.api.task;

import jakarta.validation.Valid;
import java.util.List;
import lk.weddingplanner.api.security.UserPrincipal;
import lk.weddingplanner.api.task.dto.TaskResponse;
import lk.weddingplanner.api.task.dto.UpsertTaskRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/weddings/{weddingId}/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public List<TaskResponse> list(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable Long weddingId) {
        return taskService.list(principal, weddingId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TaskResponse create(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long weddingId,
            @Valid @RequestBody UpsertTaskRequest request) {
        return taskService.create(principal, weddingId, request);
    }

    @PutMapping("/{taskId}")
    public TaskResponse update(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long weddingId,
            @PathVariable Long taskId,
            @Valid @RequestBody UpsertTaskRequest request) {
        return taskService.update(principal, weddingId, taskId, request);
    }

    @DeleteMapping("/{taskId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long weddingId,
            @PathVariable Long taskId) {
        taskService.delete(principal, weddingId, taskId);
    }
}
