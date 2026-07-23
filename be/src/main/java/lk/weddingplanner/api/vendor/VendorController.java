package lk.weddingplanner.api.vendor;

import jakarta.validation.Valid;
import lk.weddingplanner.api.common.PageResponse;
import lk.weddingplanner.api.security.UserPrincipal;
import lk.weddingplanner.api.vendor.dto.UpsertPaymentRequest;
import lk.weddingplanner.api.vendor.dto.UpsertVendorRequest;
import lk.weddingplanner.api.vendor.dto.VendorPaymentResponse;
import lk.weddingplanner.api.vendor.dto.VendorResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/weddings/{weddingId}/vendors")
@RequiredArgsConstructor
public class VendorController {

    private final VendorService vendorService;

    @GetMapping
    public PageResponse<VendorResponse> list(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long weddingId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        return vendorService.list(principal, weddingId, category, q, page, size);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VendorResponse create(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long weddingId,
            @Valid @RequestBody UpsertVendorRequest request) {
        return vendorService.create(principal, weddingId, request);
    }

    @PutMapping("/{vendorId}")
    public VendorResponse update(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long weddingId,
            @PathVariable Long vendorId,
            @Valid @RequestBody UpsertVendorRequest request) {
        return vendorService.update(principal, weddingId, vendorId, request);
    }

    @DeleteMapping("/{vendorId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long weddingId,
            @PathVariable Long vendorId) {
        vendorService.delete(principal, weddingId, vendorId);
    }

    @PostMapping("/{vendorId}/payments")
    @ResponseStatus(HttpStatus.CREATED)
    public VendorPaymentResponse addPayment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long weddingId,
            @PathVariable Long vendorId,
            @Valid @RequestBody UpsertPaymentRequest request) {
        return vendorService.addPayment(principal, weddingId, vendorId, request);
    }

    @PutMapping("/{vendorId}/payments/{paymentId}")
    public VendorPaymentResponse updatePayment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long weddingId,
            @PathVariable Long vendorId,
            @PathVariable Long paymentId,
            @Valid @RequestBody UpsertPaymentRequest request) {
        return vendorService.updatePayment(principal, weddingId, vendorId, paymentId, request);
    }

    @PostMapping("/{vendorId}/payments/{paymentId}/mark-paid")
    public VendorPaymentResponse markPaid(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long weddingId,
            @PathVariable Long vendorId,
            @PathVariable Long paymentId) {
        return vendorService.markPaid(principal, weddingId, vendorId, paymentId);
    }

    @PostMapping("/{vendorId}/payments/{paymentId}/mark-pending")
    public VendorPaymentResponse markPending(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long weddingId,
            @PathVariable Long vendorId,
            @PathVariable Long paymentId) {
        return vendorService.markPending(principal, weddingId, vendorId, paymentId);
    }

    @DeleteMapping("/{vendorId}/payments/{paymentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePayment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long weddingId,
            @PathVariable Long vendorId,
            @PathVariable Long paymentId) {
        vendorService.deletePayment(principal, weddingId, vendorId, paymentId);
    }
}
