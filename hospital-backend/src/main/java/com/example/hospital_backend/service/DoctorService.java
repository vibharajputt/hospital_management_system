package com.example.hospital_backend.service;

import com.example.hospital_backend.dto.request.DoctorProfileRequest;
import com.example.hospital_backend.dto.response.DoctorResponse;

import java.util.List;

public interface DoctorService {
    DoctorResponse createDoctorProfile(DoctorProfileRequest request);

    List<DoctorResponse> getAllDoctors();

    DoctorResponse getDoctorById(Long id);

    List<DoctorResponse> searchBySpecialization(String specialization);
}