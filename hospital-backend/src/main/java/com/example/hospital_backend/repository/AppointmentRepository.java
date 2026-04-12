package com.example.hospital_backend.repository;

import com.example.hospital_backend.entity.Appointment;
import com.example.hospital_backend.enums.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

  List<Appointment> findByPatientId(Long patientId);

  List<Appointment> findByDoctorId(Long doctorId);

  Optional<Appointment> findByDoctorIdAndAppointmentDateTime(Long doctorId, LocalDateTime appointmentDateTime);

  boolean existsByDoctorIdAndAppointmentDateTimeAndStatusIn(
      Long doctorId,
      LocalDateTime appointmentDateTime,
      List<AppointmentStatus> statuses);

  List<Appointment> findByDoctorIdAndAppointmentDateTimeBetweenAndStatusIn(
      Long doctorId,
      LocalDateTime start,
      LocalDateTime end,
      List<AppointmentStatus> statuses);

  boolean existsByDoctorIdAndPatientId(Long doctorId, Long patientId);

  // Dashboard counts
  long countByPatientId(Long patientId);

  long countByPatientIdAndStatusInAndAppointmentDateTimeAfter(Long patientId, List<AppointmentStatus> statuses,
      LocalDateTime after);

  long countByDoctorIdAndStatusInAndAppointmentDateTimeAfter(Long doctorId, List<AppointmentStatus> statuses,
      LocalDateTime after);

  long countByDoctorIdAndStatusInAndAppointmentDateTimeBetween(Long doctorId, List<AppointmentStatus> statuses,
      LocalDateTime start, LocalDateTime end);

  @Query("""
          SELECT a FROM Appointment a
          WHERE (:doctorId IS NULL OR a.doctor.id = :doctorId)
            AND (:patientId IS NULL OR a.patient.id = :patientId)
            AND (:status IS NULL OR a.status = :status)
            AND (:fromDt IS NULL OR a.appointmentDateTime >= :fromDt)
            AND (:toDt IS NULL OR a.appointmentDateTime <= :toDt)
      """)
  Page<Appointment> searchAppointments(
      @Param("doctorId") Long doctorId,
      @Param("patientId") Long patientId,
      @Param("status") AppointmentStatus status,
      @Param("fromDt") LocalDateTime fromDt,
      @Param("toDt") LocalDateTime toDt,
      Pageable pageable);
}