package com.example.hospital_backend.service;

import com.example.hospital_backend.dto.request.PatientProfileRequest;
import com.example.hospital_backend.dto.response.PatientResponse;

import java.util.List;

public interface PatientService {
    PatientResponse createPatientProfile(PatientProfileRequest request);

    PatientResponse getPatientProfileByUserId(Long userId);

    List<PatientResponse> getAllPatients();
}