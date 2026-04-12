package com.example.hospital_backend.controller;

import com.example.hospital_backend.dto.request.LabTestOrderRequest;
import com.example.hospital_backend.dto.response.LabTestResponse;
import com.example.hospital_backend.service.LabTestService;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/lab-tests")
@CrossOrigin(origins = "*")
public class LabTestController {

    private final LabTestService labTestService;

    public LabTestController(LabTestService labTestService) {
        this.labTestService = labTestService;
    }

    // Doctor orders test for own appointment
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<LabTestResponse> order(@Valid @RequestBody LabTestOrderRequest request) {
        return ResponseEntity.ok(labTestService.orderAsMyDoctor(request));
    }

    // Patient sees own tests
    @PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
    @GetMapping("/my")
    public ResponseEntity<List<LabTestResponse>> myPatientTests() {
        return ResponseEntity.ok(labTestService.myPatientLabTests());
    }

    // Doctor sees own ordered tests
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    @GetMapping("/doctor/my")
    public ResponseEntity<List<LabTestResponse>> myDoctorTests() {
        return ResponseEntity.ok(labTestService.myDoctorLabTests());
    }

    // Staff/Admin updates result + optional file (multipart)
    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')")
    @PutMapping(value = "/{id}/update", consumes = { "multipart/form-data" })
    public ResponseEntity<LabTestResponse> update(
            @PathVariable Long id,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String resultText,
            @RequestPart(required = false) MultipartFile reportFile) {
        return ResponseEntity.ok(labTestService.updateResultAsStaff(id, status, resultText, reportFile));
    }

    // Access-controlled fetch by id
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR') or hasRole('ADMIN') or hasRole('STAFF')")
    @GetMapping("/{id}")
    public ResponseEntity<LabTestResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(labTestService.getByIdForCurrentUser(id));
    }

    // Download report (access-controlled)
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR') or hasRole('ADMIN') or hasRole('STAFF')")
    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable Long id) {
        Resource resource = labTestService.downloadReport(id);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"lab-report-" + id + "\"")
                .body(resource);
    }
}