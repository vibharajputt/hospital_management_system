package com.example.hospital_backend.controller;

import com.example.hospital_backend.dto.request.DoctorProfileRequest;
import com.example.hospital_backend.dto.response.DoctorResponse;
import com.example.hospital_backend.service.DoctorService;
import org.springframework.http.ResponseEntity;
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

    @PostMapping("/profile")
    public ResponseEntity<DoctorResponse> createDoctorProfile(@RequestBody DoctorProfileRequest request) {
        return ResponseEntity.ok(doctorService.createDoctorProfile(request));
    }

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
}