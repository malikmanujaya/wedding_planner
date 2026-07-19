package lk.weddingplanner.api.checkin.dto;

import lk.weddingplanner.api.domain.AttendanceStatus;
import lk.weddingplanner.api.domain.RsvpStatus;

public record SeatFinderResponse(
        boolean matched,
        String message,
        String guestName,
        String tableLabel,
        String seatLabel,
        RsvpStatus rsvpStatus,
        AttendanceStatus attendanceStatus) {}
