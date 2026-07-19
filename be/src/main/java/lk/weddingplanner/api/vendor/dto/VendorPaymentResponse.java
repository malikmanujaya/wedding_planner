package lk.weddingplanner.api.vendor.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import lk.weddingplanner.api.domain.VendorPaymentStatus;

public record VendorPaymentResponse(
        Long id,
        String label,
        BigDecimal amount,
        LocalDate dueDate,
        LocalDate paidDate,
        VendorPaymentStatus status) {}
