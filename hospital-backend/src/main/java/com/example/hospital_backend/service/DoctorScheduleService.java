package com.example.hospital_backend.service;

import com.example.hospital_backend.dto.request.DoctorScheduleRequest;
import com.example.hospital_backend.dto.response.DoctorScheduleResponse;

import java.util.List;

public interface DoctorScheduleService {
    DoctorScheduleResponse create(DoctorScheduleRequest request);

    List<DoctorScheduleResponse> getDoctorSchedules(Long doctorId);

    List<String> getAvailableSlots(Long doctorId, String date); // YYYY-MM-DD
}