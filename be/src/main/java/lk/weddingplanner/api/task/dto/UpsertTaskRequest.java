package lk.weddingplanner.api.task.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import lk.weddingplanner.api.domain.TaskStatus;

public record UpsertTaskRequest(
        @NotBlank @Size(min = 2, max = 200) String title,
        @Size(max = 1000) String notes,
        @NotNull TaskStatus status,
        LocalDate dueDate,
        Long assigneeUserId) {}
