package com.example.hospital_backend.controller;

import com.example.hospital_backend.dto.request.DoctorProfileRequest;
import com.example.hospital_backend.dto.response.DoctorResponse;
import com.example.hospital_backend.dto.response.PageResponse;
import com.example.hospital_backend.service.DoctorService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/doctors")
@CrossOrigin(origins = "*")
public class DoctorController {

    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    // Only logged-in DOCTOR can create their profile (admin also allowed)
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    @PostMapping("/profile")
    public ResponseEntity<DoctorResponse> createDoctorProfile(@RequestBody DoctorProfileRequest request) {
        return ResponseEntity.ok(doctorService.createDoctorProfile(request));
    }

    // public browse
    @GetMapping
    public ResponseEntity<List<DoctorResponse>> getAllDoctors() {
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DoctorResponse> getDoctorById(@PathVariable Long id) {
        return ResponseEntity.ok(doctorService.getDoctorById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<DoctorResponse>> searchDoctors(@RequestParam String specialization) {
        return ResponseEntity.ok(doctorService.searchBySpecialization(specialization));
    }

    @GetMapping("/paged")
    public ResponseEntity<PageResponse<DoctorResponse>> getDoctorsPaged(
            @RequestParam(required = false) String specialization,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Double minFee,
            @RequestParam(required = false) Double maxFee,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {
        return ResponseEntity.ok(
                doctorService.searchPaged(specialization, department, minFee, maxFee, page, size, sortBy, direction));
    }

    // doctor can view own profile
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    @GetMapping("/me")
    public ResponseEntity<DoctorResponse> myDoctorProfile() {
        return ResponseEntity.ok(doctorService.getMyDoctorProfile());
    }

    // Admin approves doctor
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{doctorId}/approve")
    public ResponseEntity<DoctorResponse> approve(@PathVariable Long doctorId) {
        return ResponseEntity.ok(doctorService.approveDoctor(doctorId));
    }
}