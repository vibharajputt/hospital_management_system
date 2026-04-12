package com.example.hospital_backend.repository;

import com.example.hospital_backend.entity.Billing;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BillingRepository extends JpaRepository<Billing, Long> {

    Optional<Billing> findByAppointmentId(Long appointmentId);

    List<Billing> findByPatientIdOrderByCreatedAtDesc(Long patientId);

    List<Billing> findByDoctorIdOrderByCreatedAtDesc(Long doctorId);
}