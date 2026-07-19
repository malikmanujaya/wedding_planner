package lk.weddingplanner.api.vendor.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import lk.weddingplanner.api.domain.VendorBookingStatus;
import lk.weddingplanner.api.domain.VendorCategory;

public record VendorResponse(
        Long id,
        Long weddingId,
        String name,
        VendorCategory category,
        VendorBookingStatus status,
        String contactName,
        String email,
        String phone,
        BigDecimal quotedAmount,
        BigDecimal advanceAmount,
        BigDecimal totalPaid,
        BigDecimal remainingAmount,
        LocalDate nextDueDate,
        String notes,
        List<VendorPaymentResponse> payments) {}
