package com.example.hospital_backend.service;

import com.example.hospital_backend.dto.request.DoctorProfileRequest;
import com.example.hospital_backend.dto.response.DoctorResponse;
import com.example.hospital_backend.dto.response.PageResponse;

import java.util.List;

public interface DoctorService {
    DoctorResponse createDoctorProfile(DoctorProfileRequest request);

    List<DoctorResponse> getAllDoctors();

    DoctorResponse getDoctorById(Long id);

    List<DoctorResponse> searchBySpecialization(String specialization);

    PageResponse<DoctorResponse> searchPaged(
            String specialization,
            String department,
            Double minFee,
            Double maxFee,
            int page,
            int size,
            String sortBy,
            String direction);

    DoctorResponse approveDoctor(Long doctorId);

    DoctorResponse getMyDoctorProfile(); // current logged-in doctor
}