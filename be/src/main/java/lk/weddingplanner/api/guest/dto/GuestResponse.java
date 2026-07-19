package lk.weddingplanner.api.guest.dto;

import lk.weddingplanner.api.domain.AttendanceStatus;
import lk.weddingplanner.api.domain.RsvpStatus;

public record GuestResponse(
        Long id,
        Long weddingId,
        String fullName,
        String email,
        String phone,
        String household,
        String mealPreference,
        RsvpStatus rsvpStatus,
        String tags,
        String tableLabel,
        String notes,
        String inviteToken,
        AttendanceStatus attendanceStatus,
        String checkedInAt) {}
