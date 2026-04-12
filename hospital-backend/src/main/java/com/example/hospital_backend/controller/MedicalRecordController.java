package com.example.hospital_backend.controller;

import com.example.hospital_backend.dto.response.MedicalRecordResponse;
import com.example.hospital_backend.service.MedicalRecordService;
import jakarta.validation.constraints.NotBlank;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/medical-records")
@CrossOrigin(origins = "*")
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;

    public MedicalRecordController(MedicalRecordService medicalRecordService) {
        this.medicalRecordService = medicalRecordService;
    }

    // PATIENT uploads own record
    @PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
    @PostMapping("/upload")
    public ResponseEntity<MedicalRecordResponse> uploadMyRecord(
            @RequestParam("file") MultipartFile file,
            @RequestParam("recordType") @NotBlank String recordType,
            @RequestParam("title") @NotBlank String title,
            @RequestParam(value = "description", required = false) String description) {
        return ResponseEntity.ok(medicalRecordService.uploadMyRecord(file, recordType, title, description));
    }

    // PATIENT gets own records
    @PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
    @GetMapping("/my")
    public ResponseEntity<List<MedicalRecordResponse>> myRecords() {
        return ResponseEntity.ok(medicalRecordService.getMyRecords());
    }

    // DOCTOR can view records only if has appointment with patient
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<MedicalRecordResponse>> patientRecords(@PathVariable Long patientId) {
        return ResponseEntity.ok(medicalRecordService.getPatientRecordsForDoctor(patientId));
    }

    // Download
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR') or hasRole('ADMIN')")
    @GetMapping("/{recordId}/download")
    public ResponseEntity<Resource> download(@PathVariable Long recordId) {
        Resource resource = medicalRecordService.downloadRecord(recordId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"record-" + recordId + "\"")
                .body(resource);
    }
}