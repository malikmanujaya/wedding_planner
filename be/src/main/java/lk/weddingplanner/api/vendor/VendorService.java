package lk.weddingplanner.api.vendor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import lk.weddingplanner.api.common.ApiException;
import lk.weddingplanner.api.common.PageRequestParams;
import lk.weddingplanner.api.common.PageResponse;
import lk.weddingplanner.api.domain.VendorBookingStatus;
import lk.weddingplanner.api.domain.VendorCategory;
import lk.weddingplanner.api.domain.VendorPayment;
import lk.weddingplanner.api.domain.VendorPaymentStatus;
import lk.weddingplanner.api.domain.Wedding;
import lk.weddingplanner.api.domain.WeddingVendor;
import lk.weddingplanner.api.repository.VendorPaymentRepository;
import lk.weddingplanner.api.repository.WeddingVendorRepository;
import lk.weddingplanner.api.security.UserPrincipal;
import lk.weddingplanner.api.vendor.dto.UpsertPaymentRequest;
import lk.weddingplanner.api.vendor.dto.UpsertVendorRequest;
import lk.weddingplanner.api.vendor.dto.VendorPaymentResponse;
import lk.weddingplanner.api.vendor.dto.VendorResponse;
import lk.weddingplanner.api.wedding.WeddingAccessService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class VendorService {

    private final WeddingVendorRepository vendorRepository;
    private final VendorPaymentRepository paymentRepository;
    private final WeddingAccessService weddingAccessService;

    @Transactional(readOnly = true)
    public PageResponse<VendorResponse> list(
            UserPrincipal principal, Long weddingId, String category, String q, Integer page, Integer size) {
        weddingAccessService.requireMemberWedding(principal, weddingId);
        VendorCategory categoryFilter = parseCategoryOrNull(category);
        String query = q != null ? q.trim().toLowerCase(Locale.ROOT) : "";

        List<VendorResponse> all =
                vendorRepository.findAllByWeddingId(weddingId).stream()
                        .filter(v -> categoryFilter == null || v.getCategory() == categoryFilter)
                        .filter(v -> query.isEmpty() || matches(v, query))
                        .map(this::toResponse)
                        .toList();
        return PageRequestParams.of(page, size).paginate(all);
    }

    @Transactional
    public VendorResponse create(
            UserPrincipal principal, Long weddingId, UpsertVendorRequest request) {
        Wedding wedding = weddingAccessService.requireMemberWedding(principal, weddingId);
        WeddingVendor vendor = new WeddingVendor();
        vendor.setWedding(wedding);
        apply(vendor, request);
        vendorRepository.save(vendor);
        syncDefaultPayments(vendor, request);
        return toResponse(vendor);
    }

    @Transactional
    public VendorResponse update(
            UserPrincipal principal, Long weddingId, Long vendorId, UpsertVendorRequest request) {
        weddingAccessService.requireMemberWedding(principal, weddingId);
        WeddingVendor vendor = requireVendor(weddingId, vendorId);
        apply(vendor, request);
        vendor.setUpdatedAt(Instant.now());
        vendorRepository.save(vendor);
        syncDefaultPayments(vendor, request);
        return toResponse(vendor);
    }

    @Transactional
    public void delete(UserPrincipal principal, Long weddingId, Long vendorId) {
        weddingAccessService.requireMemberWedding(principal, weddingId);
        WeddingVendor vendor = requireVendor(weddingId, vendorId);
        paymentRepository.deleteByVendor_Id(vendor.getId());
        vendorRepository.delete(vendor);
    }

    @Transactional
    public VendorPaymentResponse addPayment(
            UserPrincipal principal, Long weddingId, Long vendorId, UpsertPaymentRequest request) {
        weddingAccessService.requireMemberWedding(principal, weddingId);
        WeddingVendor vendor = requireVendor(weddingId, vendorId);
        VendorPayment payment = new VendorPayment();
        payment.setVendor(vendor);
        payment.setLabel(request.label().trim());
        payment.setAmount(request.amount());
        payment.setDueDate(request.dueDate());
        payment.setStatus(VendorPaymentStatus.PENDING);
        return toPaymentResponse(paymentRepository.save(payment));
    }

    @Transactional
    public VendorPaymentResponse updatePayment(
            UserPrincipal principal,
            Long weddingId,
            Long vendorId,
            Long paymentId,
            UpsertPaymentRequest request) {
        weddingAccessService.requireMemberWedding(principal, weddingId);
        VendorPayment payment = requirePayment(weddingId, vendorId, paymentId);
        if (payment.getStatus() == VendorPaymentStatus.PAID) {
            throw new ApiException("Paid installment cannot be edited", HttpStatus.BAD_REQUEST);
        }
        payment.setLabel(request.label().trim());
        payment.setAmount(request.amount());
        payment.setDueDate(request.dueDate());
        return toPaymentResponse(paymentRepository.save(payment));
    }

    @Transactional
    public VendorPaymentResponse markPaid(
            UserPrincipal principal, Long weddingId, Long vendorId, Long paymentId) {
        weddingAccessService.requireMemberWedding(principal, weddingId);
        VendorPayment payment = requirePayment(weddingId, vendorId, paymentId);
        payment.setStatus(VendorPaymentStatus.PAID);
        payment.setPaidDate(LocalDate.now());
        return toPaymentResponse(paymentRepository.save(payment));
    }

    @Transactional
    public VendorPaymentResponse markPending(
            UserPrincipal principal, Long weddingId, Long vendorId, Long paymentId) {
        weddingAccessService.requireMemberWedding(principal, weddingId);
        VendorPayment payment = requirePayment(weddingId, vendorId, paymentId);
        payment.setStatus(VendorPaymentStatus.PENDING);
        payment.setPaidDate(null);
        return toPaymentResponse(paymentRepository.save(payment));
    }

    @Transactional
    public void deletePayment(
            UserPrincipal principal, Long weddingId, Long vendorId, Long paymentId) {
        weddingAccessService.requireMemberWedding(principal, weddingId);
        VendorPayment payment = requirePayment(weddingId, vendorId, paymentId);
        paymentRepository.delete(payment);
    }

    private void syncDefaultPayments(WeddingVendor vendor, UpsertVendorRequest request) {
        BigDecimal quoted = zeroIfNull(request.quotedAmount());
        BigDecimal advance = zeroIfNull(request.advanceAmount());
        if (advance.compareTo(BigDecimal.ZERO) < 0) {
            throw new ApiException("Advance cannot be negative", HttpStatus.BAD_REQUEST);
        }
        if (quoted.compareTo(BigDecimal.ZERO) > 0 && advance.compareTo(quoted) > 0) {
            throw new ApiException("Advance cannot exceed quoted amount", HttpStatus.BAD_REQUEST);
        }

        List<VendorPayment> existing = paymentRepository.findAllByVendorId(vendor.getId());
        VendorPayment advancePayment =
                existing.stream()
                        .filter(p -> "Advance".equalsIgnoreCase(p.getLabel()))
                        .findFirst()
                        .orElse(null);
        VendorPayment remainingPayment =
                existing.stream()
                        .filter(p -> "Remaining balance".equalsIgnoreCase(p.getLabel()))
                        .findFirst()
                        .orElse(null);

        if (advance.compareTo(BigDecimal.ZERO) > 0) {
            if (advancePayment == null) {
                advancePayment = new VendorPayment();
                advancePayment.setVendor(vendor);
                advancePayment.setLabel("Advance");
                advancePayment.setStatus(VendorPaymentStatus.PENDING);
            }
            if (advancePayment.getStatus() != VendorPaymentStatus.PAID) {
                advancePayment.setAmount(advance);
                advancePayment.setDueDate(request.advanceDueDate());
                paymentRepository.save(advancePayment);
            }
        } else if (advancePayment != null && advancePayment.getStatus() != VendorPaymentStatus.PAID) {
            paymentRepository.delete(advancePayment);
        }

        BigDecimal remaining = quoted.subtract(advance);
        if (remaining.compareTo(BigDecimal.ZERO) > 0) {
            if (remainingPayment == null) {
                remainingPayment = new VendorPayment();
                remainingPayment.setVendor(vendor);
                remainingPayment.setLabel("Remaining balance");
                remainingPayment.setStatus(VendorPaymentStatus.PENDING);
            }
            if (remainingPayment.getStatus() != VendorPaymentStatus.PAID) {
                remainingPayment.setAmount(remaining);
                remainingPayment.setDueDate(request.remainingDueDate());
                paymentRepository.save(remainingPayment);
            }
        } else if (remainingPayment != null
                && remainingPayment.getStatus() != VendorPaymentStatus.PAID) {
            paymentRepository.delete(remainingPayment);
        }
    }

    private void apply(WeddingVendor vendor, UpsertVendorRequest request) {
        vendor.setName(request.name().trim());
        vendor.setCategory(request.category() != null ? request.category() : VendorCategory.OTHER);
        vendor.setStatus(
                request.status() != null ? request.status() : VendorBookingStatus.PENDING);
        vendor.setContactName(blankToNull(request.contactName()));
        vendor.setEmail(blankToNull(request.email()));
        vendor.setPhone(blankToNull(request.phone()));
        vendor.setQuotedAmount(request.quotedAmount());
        vendor.setNotes(blankToNull(request.notes()));
    }

    private VendorResponse toResponse(WeddingVendor vendor) {
        List<VendorPayment> payments = paymentRepository.findAllByVendorId(vendor.getId());
        LocalDate today = LocalDate.now();
        List<VendorPaymentResponse> paymentResponses = new ArrayList<>();
        BigDecimal totalPaid = BigDecimal.ZERO;
        BigDecimal remaining = BigDecimal.ZERO;
        LocalDate nextDue = null;

        for (VendorPayment payment : payments) {
            VendorPaymentStatus displayStatus = payment.getStatus();
            if (displayStatus == VendorPaymentStatus.PENDING
                    && payment.getDueDate() != null
                    && payment.getDueDate().isBefore(today)) {
                displayStatus = VendorPaymentStatus.OVERDUE;
            }
            paymentResponses.add(
                    new VendorPaymentResponse(
                            payment.getId(),
                            payment.getLabel(),
                            payment.getAmount(),
                            payment.getDueDate(),
                            payment.getPaidDate(),
                            displayStatus));

            if (payment.getStatus() == VendorPaymentStatus.PAID) {
                totalPaid = totalPaid.add(zeroIfNull(payment.getAmount()));
            } else {
                remaining = remaining.add(zeroIfNull(payment.getAmount()));
                if (payment.getDueDate() != null
                        && (nextDue == null || payment.getDueDate().isBefore(nextDue))) {
                    nextDue = payment.getDueDate();
                }
            }
        }

        paymentResponses.sort(
                Comparator.comparing(
                        VendorPaymentResponse::dueDate,
                        Comparator.nullsLast(Comparator.naturalOrder())));

        BigDecimal advanceAmount =
                payments.stream()
                        .filter(p -> "Advance".equalsIgnoreCase(p.getLabel()))
                        .map(VendorPayment::getAmount)
                        .findFirst()
                        .orElse(BigDecimal.ZERO);

        return new VendorResponse(
                vendor.getId(),
                vendor.getWedding().getId(),
                vendor.getName(),
                vendor.getCategory(),
                vendor.getStatus(),
                vendor.getContactName(),
                vendor.getEmail(),
                vendor.getPhone(),
                vendor.getQuotedAmount(),
                advanceAmount,
                totalPaid,
                remaining,
                nextDue,
                vendor.getNotes(),
                paymentResponses);
    }

    private VendorPaymentResponse toPaymentResponse(VendorPayment payment) {
        VendorPaymentStatus displayStatus = payment.getStatus();
        if (displayStatus == VendorPaymentStatus.PENDING
                && payment.getDueDate() != null
                && payment.getDueDate().isBefore(LocalDate.now())) {
            displayStatus = VendorPaymentStatus.OVERDUE;
        }
        return new VendorPaymentResponse(
                payment.getId(),
                payment.getLabel(),
                payment.getAmount(),
                payment.getDueDate(),
                payment.getPaidDate(),
                displayStatus);
    }

    private WeddingVendor requireVendor(Long weddingId, Long vendorId) {
        return vendorRepository
                .findByIdAndWeddingId(vendorId, weddingId)
                .orElseThrow(() -> new ApiException("Vendor not found", HttpStatus.NOT_FOUND));
    }

    private VendorPayment requirePayment(Long weddingId, Long vendorId, Long paymentId) {
        return paymentRepository
                .findByIdAndVendorAndWedding(paymentId, vendorId, weddingId)
                .orElseThrow(() -> new ApiException("Payment not found", HttpStatus.NOT_FOUND));
    }

    private boolean matches(WeddingVendor v, String query) {
        return contains(v.getName(), query)
                || contains(v.getContactName(), query)
                || contains(v.getEmail(), query)
                || contains(v.getPhone(), query)
                || contains(v.getNotes(), query)
                || v.getCategory().name().toLowerCase(Locale.ROOT).contains(query);
    }

    private boolean contains(String value, String query) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(query);
    }

    private VendorCategory parseCategoryOrNull(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        try {
            return VendorCategory.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private String blankToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private BigDecimal zeroIfNull(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }
}
