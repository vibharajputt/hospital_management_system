package com.example.hospital_backend.service;

import com.example.hospital_backend.dto.request.AppointmentRequest;
import com.example.hospital_backend.dto.request.AppointmentStatusUpdateRequest;
import com.example.hospital_backend.dto.request.BookAppointmentRequest;
import com.example.hospital_backend.dto.response.AppointmentResponse;
import com.example.hospital_backend.dto.response.PageResponse;

import java.util.List;

public interface AppointmentService {

    // patient books for self (no patientId in request)
    AppointmentResponse bookSelf(BookAppointmentRequest request);

    // admin/old endpoints (keep)
    AppointmentResponse book(AppointmentRequest request);

    List<AppointmentResponse> getAll();

    List<AppointmentResponse> getByPatient(Long patientId);

    List<AppointmentResponse> getByDoctor(Long doctorId);

    // ownership safe
    List<AppointmentResponse> getMyPatientAppointments();

    List<AppointmentResponse> getMyDoctorAppointments();

    // doctor updates status only for own appointment + only if approved
    AppointmentResponse updateStatusAsMyDoctor(Long appointmentId, AppointmentStatusUpdateRequest request);

    AppointmentResponse updateStatus(Long appointmentId, AppointmentStatusUpdateRequest request);

    AppointmentResponse reschedule(Long appointmentId, AppointmentRequest request);

    AppointmentResponse cancel(Long appointmentId);

    PageResponse<AppointmentResponse> searchPaged(
            Long doctorId,
            Long patientId,
            String status,
            String from,
            String to,
            int page,
            int size,
            String sortBy,
            String direction);
}