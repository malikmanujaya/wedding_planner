package lk.weddingplanner.api.checkin.dto;

import jakarta.validation.constraints.NotNull;
import lk.weddingplanner.api.domain.AttendanceStatus;

public record CheckInActionRequest(@NotNull AttendanceStatus action) {}
