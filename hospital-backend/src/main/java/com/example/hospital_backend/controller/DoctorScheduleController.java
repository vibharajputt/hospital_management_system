package com.example.hospital_backend.controller;

import com.example.hospital_backend.dto.request.DoctorScheduleRequest;
import com.example.hospital_backend.dto.response.DoctorScheduleResponse;
import com.example.hospital_backend.service.DoctorScheduleService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/doctor-schedules")
@CrossOrigin(origins = "*")
public class DoctorScheduleController {

    private final DoctorScheduleService doctorScheduleService;

    public DoctorScheduleController(DoctorScheduleService doctorScheduleService) {
        this.doctorScheduleService = doctorScheduleService;
    }

    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<DoctorScheduleResponse> create(@Valid @RequestBody DoctorScheduleRequest request) {
        return ResponseEntity.ok(doctorScheduleService.create(request));
    }

    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<DoctorScheduleResponse>> schedules(@PathVariable Long doctorId) {
        return ResponseEntity.ok(doctorScheduleService.getDoctorSchedules(doctorId));
    }

    // Public (configured in SecurityConfig)
    @GetMapping("/doctor/{doctorId}/slots")
    public ResponseEntity<List<String>> slots(@PathVariable Long doctorId, @RequestParam String date) {
        return ResponseEntity.ok(doctorScheduleService.getAvailableSlots(doctorId, date));
    }
}
