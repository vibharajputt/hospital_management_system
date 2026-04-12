package com.example.hospital_backend.service;

import com.example.hospital_backend.dto.request.LabTestOrderRequest;
import com.example.hospital_backend.dto.response.LabTestResponse;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface LabTestService {

    LabTestResponse orderAsMyDoctor(LabTestOrderRequest request);

    List<LabTestResponse> myPatientLabTests();

    List<LabTestResponse> myDoctorLabTests();

    // STAFF/ADMIN updates result + optional report file
    LabTestResponse updateResultAsStaff(Long labTestId, String status, String resultText, MultipartFile reportFile);

    // access-controlled
    LabTestResponse getByIdForCurrentUser(Long labTestId);

    Resource downloadReport(Long labTestId);
}