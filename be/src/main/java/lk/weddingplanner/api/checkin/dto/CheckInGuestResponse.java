package lk.weddingplanner.api.checkin.dto;

import lk.weddingplanner.api.domain.AttendanceStatus;
import lk.weddingplanner.api.domain.RsvpStatus;

public record CheckInGuestResponse(
        Long id,
        String fullName,
        String household,
        RsvpStatus rsvpStatus,
        String tableLabel,
        String seatLabel,
        String inviteToken,
        AttendanceStatus attendanceStatus,
        String checkedInAt) {}
