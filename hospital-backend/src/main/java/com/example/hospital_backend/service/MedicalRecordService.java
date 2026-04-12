package com.example.hospital_backend.service;

import com.example.hospital_backend.dto.response.MedicalRecordResponse;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface MedicalRecordService {

    MedicalRecordResponse uploadMyRecord(MultipartFile file, String recordType, String title, String description);

    List<MedicalRecordResponse> getMyRecords();

    List<MedicalRecordResponse> getPatientRecordsForDoctor(Long patientId);

    Resource downloadRecord(Long recordId);
}