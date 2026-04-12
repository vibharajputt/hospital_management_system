package com.example.hospital_backend.controller;

import com.example.hospital_backend.dto.request.BillingCreateRequest;
import com.example.hospital_backend.dto.request.BillingPayRequest;
import com.example.hospital_backend.dto.response.BillingResponse;
import com.example.hospital_backend.service.BillingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/billing")
@CrossOrigin(origins = "*")
public class BillingController {

    private final BillingService billingService;

    public BillingController(BillingService billingService) {
        this.billingService = billingService;
    }

    // Admin/Staff generates bill for an appointment
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    @PostMapping
    public ResponseEntity<BillingResponse> create(@Valid @RequestBody BillingCreateRequest request) {
        return ResponseEntity.ok(billingService.createBill(request));
    }

    // Patient sees own bills
    @PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
    @GetMapping("/my")
    public ResponseEntity<List<BillingResponse>> myBills() {
        return ResponseEntity.ok(billingService.getMyBillsAsPatient());
    }

    // Doctor sees bills for own appointments
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    @GetMapping("/doctor/my")
    public ResponseEntity<List<BillingResponse>> doctorBills() {
        return ResponseEntity.ok(billingService.getMyBillsAsDoctor());
    }

    // Get bill by id (access-controlled)
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR') or hasRole('ADMIN') or hasRole('STAFF')")
    @GetMapping("/{id}")
    public ResponseEntity<BillingResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(billingService.getByIdForCurrentUser(id));
    }

    // Patient pays own bill
    @PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
    @PutMapping("/{id}/pay")
    public ResponseEntity<BillingResponse> pay(@PathVariable Long id, @Valid @RequestBody BillingPayRequest request) {
        return ResponseEntity.ok(billingService.payMyBill(id, request));
    }
}