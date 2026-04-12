package com.example.hospital_backend.repository;

import com.example.hospital_backend.entity.Billing;
import com.example.hospital_backend.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BillingRepository extends JpaRepository<Billing, Long> {

    Optional<Billing> findByAppointmentId(Long appointmentId);

    List<Billing> findByPatientIdOrderByCreatedAtDesc(Long patientId);

    List<Billing> findByDoctorIdOrderByCreatedAtDesc(Long doctorId);

    // Dashboard
    long countByPatientId(Long patientId);

    long countByPatientIdAndStatus(Long patientId, PaymentStatus status);

    @Query("select coalesce(sum(b.amount), 0) from Billing b where b.status = :status")
    Double sumAmountByStatus(@Param("status") PaymentStatus status);
}