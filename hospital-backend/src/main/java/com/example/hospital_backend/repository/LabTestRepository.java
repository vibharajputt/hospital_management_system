package com.example.hospital_backend.repository;

import com.example.hospital_backend.entity.LabTest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LabTestRepository extends JpaRepository<LabTest, Long> {

    List<LabTest> findByPatientIdOrderByCreatedAtDesc(Long patientId);

    List<LabTest> findByDoctorIdOrderByCreatedAtDesc(Long doctorId);

    List<LabTest> findByAppointmentIdOrderByCreatedAtDesc(Long appointmentId);
}