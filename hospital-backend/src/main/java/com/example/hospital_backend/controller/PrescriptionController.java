package com.example.hospital_backend.controller;

import com.example.hospital_backend.dto.request.PrescriptionRequest;
import com.example.hospital_backend.dto.response.PrescriptionResponse;
import com.example.hospital_backend.service.PrescriptionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/prescriptions")
@CrossOrigin(origins = "*")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    public PrescriptionController(PrescriptionService prescriptionService) {
        this.prescriptionService = prescriptionService;
    }

    // Doctor writes prescription for own appointment (approved doctor)
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<PrescriptionResponse> create(@Valid @RequestBody PrescriptionRequest request) {
        return ResponseEntity.ok(prescriptionService.createPrescriptionAsMyDoctor(request));
    }

    // Patient sees own prescriptions
    @PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
    @GetMapping("/my")
    public ResponseEntity<List<PrescriptionResponse>> myPatientPrescriptions() {
        return ResponseEntity.ok(prescriptionService.getMyPatientPrescriptions());
    }

    // Doctor sees own written prescriptions
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    @GetMapping("/doctor/my")
    public ResponseEntity<List<PrescriptionResponse>> myDoctorPrescriptions() {
        return ResponseEntity.ok(prescriptionService.getMyDoctorPrescriptions());
    }

    // Get by prescription id (access-controlled)
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR') or hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<PrescriptionResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(prescriptionService.getByIdForCurrentUser(id));
    }

    // Get by appointment id (access-controlled)
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR') or hasRole('ADMIN')")
    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<PrescriptionResponse> getByAppointment(@PathVariable Long appointmentId) {
        return ResponseEntity.ok(prescriptionService.getByAppointmentForCurrentUser(appointmentId));
    }
}