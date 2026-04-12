package com.example.hospital_backend.controller;

import com.example.hospital_backend.dto.request.AppointmentRequest;
import com.example.hospital_backend.dto.request.AppointmentStatusUpdateRequest;
<<<<<<< HEAD
=======
import com.example.hospital_backend.dto.request.BookAppointmentRequest;
>>>>>>> c0dac223ccdeae0dd8781e2b7cc8c99a648085d5
import com.example.hospital_backend.dto.response.AppointmentResponse;
import com.example.hospital_backend.dto.response.PageResponse;
import com.example.hospital_backend.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/appointments")
@CrossOrigin(origins = "*")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

<<<<<<< HEAD
    @PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
=======
    // Patient books for SELF
    @PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
    @PostMapping("/book")
    public ResponseEntity<AppointmentResponse> bookSelf(@Valid @RequestBody BookAppointmentRequest request) {
        return ResponseEntity.ok(appointmentService.bookSelf(request));
    }

    // Keep old admin booking
    @PreAuthorize("hasRole('ADMIN')")
>>>>>>> c0dac223ccdeae0dd8781e2b7cc8c99a648085d5
    @PostMapping
    public ResponseEntity<AppointmentResponse> book(@Valid @RequestBody AppointmentRequest request) {
        return ResponseEntity.ok(appointmentService.book(request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<AppointmentResponse>> all() {
        return ResponseEntity.ok(appointmentService.getAll());
    }

<<<<<<< HEAD
    @PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<AppointmentResponse>> byPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(appointmentService.getByPatient(patientId));
    }

    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<AppointmentResponse>> byDoctor(@PathVariable Long doctorId) {
        return ResponseEntity.ok(appointmentService.getByDoctor(doctorId));
    }

    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    @PutMapping("/{appointmentId}/status")
    public ResponseEntity<AppointmentResponse> status(@PathVariable Long appointmentId,
            @Valid @RequestBody AppointmentStatusUpdateRequest request) {
        return ResponseEntity.ok(appointmentService.updateStatus(appointmentId, request));
    }

=======
    // Patient sees own appointments
    @PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
    @GetMapping("/my")
    public ResponseEntity<List<AppointmentResponse>> myPatientAppointments() {
        return ResponseEntity.ok(appointmentService.getMyPatientAppointments());
    }

    // Doctor sees own appointments
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    @GetMapping("/doctor/my")
    public ResponseEntity<List<AppointmentResponse>> myDoctorAppointments() {
        return ResponseEntity.ok(appointmentService.getMyDoctorAppointments());
    }

    // Doctor updates status for OWN appointment (approved doctor only)
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    @PutMapping("/{appointmentId}/status")
    public ResponseEntity<AppointmentResponse> statusAsDoctor(@PathVariable Long appointmentId,
            @Valid @RequestBody AppointmentStatusUpdateRequest request) {
        return ResponseEntity.ok(appointmentService.updateStatusAsMyDoctor(appointmentId, request));
    }

    // Patient reschedule/cancel own
>>>>>>> c0dac223ccdeae0dd8781e2b7cc8c99a648085d5
    @PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
    @PutMapping("/{appointmentId}/reschedule")
    public ResponseEntity<AppointmentResponse> reschedule(@PathVariable Long appointmentId,
            @Valid @RequestBody AppointmentRequest request) {
        return ResponseEntity.ok(appointmentService.reschedule(appointmentId, request));
    }

    @PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
    @DeleteMapping("/{appointmentId}")
    public ResponseEntity<AppointmentResponse> cancel(@PathVariable Long appointmentId) {
        return ResponseEntity.ok(appointmentService.cancel(appointmentId));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/paged")
    public ResponseEntity<PageResponse<AppointmentResponse>> paged(
            @RequestParam(required = false) Long doctorId,
            @RequestParam(required = false) Long patientId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "appointmentDateTime") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        return ResponseEntity.ok(
                appointmentService.searchPaged(doctorId, patientId, status, from, to, page, size, sortBy, direction));
    }
<<<<<<< HEAD
}
=======
}
>>>>>>> c0dac223ccdeae0dd8781e2b7cc8c99a648085d5
