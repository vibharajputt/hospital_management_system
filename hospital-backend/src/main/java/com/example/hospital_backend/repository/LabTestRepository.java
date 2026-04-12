package com.example.hospital_backend.repository;

import com.example.hospital_backend.entity.LabTest;
import com.example.hospital_backend.enums.LabTestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LabTestRepository extends JpaRepository<LabTest, Long> {

    List<LabTest> findByPatientIdOrderByCreatedAtDesc(Long patientId);

    List<LabTest> findByDoctorIdOrderByCreatedAtDesc(Long doctorId);

    List<LabTest> findByAppointmentIdOrderByCreatedAtDesc(Long appointmentId);

    // Dashboard
    long countByPatientIdAndStatusIn(Long patientId, List<LabTestStatus> statuses);

    long countByDoctorIdAndStatusIn(Long doctorId, List<LabTestStatus> statuses);
}