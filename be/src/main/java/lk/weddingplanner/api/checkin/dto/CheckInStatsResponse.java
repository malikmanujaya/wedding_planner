package lk.weddingplanner.api.checkin.dto;

public record CheckInStatsResponse(long totalGuests, long admitted, long rejected, long notArrived) {}
