package com.example.hospital_backend.service;

import com.example.hospital_backend.dto.request.PrescriptionRequest;
import com.example.hospital_backend.dto.response.PrescriptionResponse;

import java.util.List;

public interface PrescriptionService {

    PrescriptionResponse createPrescriptionAsMyDoctor(PrescriptionRequest request);

    List<PrescriptionResponse> getMyPatientPrescriptions();

    List<PrescriptionResponse> getMyDoctorPrescriptions();

    PrescriptionResponse getByIdForCurrentUser(Long id);

    PrescriptionResponse getByAppointmentForCurrentUser(Long appointmentId);
}