package com.example.hospital_backend.controller;

import com.example.hospital_backend.dto.request.PatientProfileRequest;
import com.example.hospital_backend.dto.response.PatientResponse;
import com.example.hospital_backend.service.PatientService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/patients")
@CrossOrigin(origins = "*")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
    @PostMapping("/profile")
    public ResponseEntity<PatientResponse> createPatientProfile(@Valid @RequestBody PatientProfileRequest request) {
        return ResponseEntity.ok(patientService.createPatientProfile(request));
    }

    // NOTE: this is by userId (same as your earlier design)
    @PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
    @GetMapping("/{userId}")
    public ResponseEntity<PatientResponse> getPatientProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(patientService.getPatientProfileByUserId(userId));
<<<<<<< HEAD
=======
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<PatientResponse>> getAllPatients() {
        return ResponseEntity.ok(patientService.getAllPatients());
>>>>>>> c0dac223ccdeae0dd8781e2b7cc8c99a648085d5
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<PatientResponse>> getAllPatients() {
        return ResponseEntity.ok(patientService.getAllPatients());
    }
}
