package lk.weddingplanner.api.task.dto;

import java.time.LocalDate;
import lk.weddingplanner.api.domain.TaskStatus;

public record TaskResponse(
        Long id,
        Long weddingId,
        String title,
        String notes,
        TaskStatus status,
        LocalDate dueDate,
        Long assigneeUserId,
        String assigneeName) {}
