package com.example.hospital_backend.service.impl;

import com.example.hospital_backend.dto.request.AppointmentRequest;
import com.example.hospital_backend.dto.request.AppointmentStatusUpdateRequest;
import com.example.hospital_backend.dto.response.AppointmentResponse;
import com.example.hospital_backend.dto.response.PageResponse;
import com.example.hospital_backend.entity.Appointment;
import com.example.hospital_backend.entity.Doctor;
import com.example.hospital_backend.entity.Patient;
import com.example.hospital_backend.enums.AppointmentStatus;
import com.example.hospital_backend.exception.ConflictException;
import com.example.hospital_backend.exception.ResourceNotFoundException;
import com.example.hospital_backend.repository.AppointmentRepository;
import com.example.hospital_backend.repository.DoctorRepository;
import com.example.hospital_backend.repository.PatientRepository;
import com.example.hospital_backend.service.AppointmentService;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    public AppointmentServiceImpl(AppointmentRepository appointmentRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
    }

    @Override
    @Transactional
    public AppointmentResponse book(AppointmentRequest request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        LocalDateTime dt = LocalDateTime.parse(request.getAppointmentDateTime());

        // If a row already exists for doctor+dt, handle it
        Appointment existing = appointmentRepository.findByDoctorIdAndAppointmentDateTime(doctor.getId(), dt)
                .orElse(null);

        if (existing != null) {
            if (existing.getStatus() == AppointmentStatus.CANCELLED) {
                // Reuse cancelled slot (same row)
                existing.setPatient(patient);
                existing.setSymptoms(request.getSymptoms());
                existing.setNotes(request.getNotes());
                existing.setStatus(AppointmentStatus.BOOKED);
                return map(appointmentRepository.save(existing));
            }
            throw new ConflictException("This slot is already booked for the doctor");
        }

        try {
            Appointment a = new Appointment();
            a.setPatient(patient);
            a.setDoctor(doctor);
            a.setAppointmentDateTime(dt);
            a.setSymptoms(request.getSymptoms());
            a.setNotes(request.getNotes());
            a.setStatus(AppointmentStatus.BOOKED);

            return map(appointmentRepository.save(a));

        } catch (DataIntegrityViolationException e) {
            // This catches race condition: another booking inserted same (doctor_id,
            // datetime)
            throw new ConflictException("This slot is already booked for the doctor");
        }
    }

    @Override
    public List<AppointmentResponse> getAll() {
        return appointmentRepository.findAll().stream().map(this::map).collect(Collectors.toList());
    }

    @Override
    public List<AppointmentResponse> getByPatient(Long patientId) {
        return appointmentRepository.findByPatientId(patientId).stream().map(this::map).collect(Collectors.toList());
    }

    @Override
    public List<AppointmentResponse> getByDoctor(Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId).stream().map(this::map).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AppointmentResponse updateStatus(Long appointmentId, AppointmentStatusUpdateRequest request) {
        Appointment a = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        a.setStatus(AppointmentStatus.valueOf(request.getStatus().toUpperCase()));
        return map(appointmentRepository.save(a));
    }

    /**
     * Safe reschedule = Cancel old appointment + Book new slot
     * (History preserved because old remains CANCELLED)
     */
    @Override
    @Transactional
    public AppointmentResponse reschedule(Long appointmentId, AppointmentRequest request) {
        Appointment old = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        // Cancel old first (history preserved)
        old.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(old);

        // Book new with same patient & doctor
        AppointmentRequest newReq = new AppointmentRequest();
        newReq.setPatientId(old.getPatient().getId());
        newReq.setDoctorId(old.getDoctor().getId());
        newReq.setAppointmentDateTime(request.getAppointmentDateTime());
        newReq.setSymptoms(request.getSymptoms());
        newReq.setNotes(request.getNotes());

        return book(newReq);
    }

    @Override
    @Transactional
    public AppointmentResponse cancel(Long appointmentId) {
        Appointment a = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        a.setStatus(AppointmentStatus.CANCELLED);
        return map(appointmentRepository.save(a));
    }

    @Override
    public PageResponse<AppointmentResponse> searchPaged(Long doctorId, Long patientId, String status,
            String from, String to,
            int page, int size,
            String sortBy, String direction) {

        Sort sort = "desc".equalsIgnoreCase(direction)
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        PageRequest pageable = PageRequest.of(page, size, sort);

        AppointmentStatus st = (status == null || status.isBlank())
                ? null
                : AppointmentStatus.valueOf(status.toUpperCase());

        LocalDateTime fromDt = (from == null || from.isBlank()) ? null : LocalDateTime.parse(from);
        LocalDateTime toDt = (to == null || to.isBlank()) ? null : LocalDateTime.parse(to);

        Page<Appointment> result = appointmentRepository.searchAppointments(
                doctorId, patientId, st, fromDt, toDt, pageable);

        List<AppointmentResponse> content = result.getContent().stream().map(this::map).collect(Collectors.toList());

        return new PageResponse<>(
                content,
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages(),
                result.isLast());
    }

    private AppointmentResponse map(Appointment a) {
        AppointmentResponse r = new AppointmentResponse();
        r.setId(a.getId());
        r.setPatientId(a.getPatient().getId());
        r.setPatientName(a.getPatient().getUser().getFullName());
        r.setDoctorId(a.getDoctor().getId());
        r.setDoctorName(a.getDoctor().getUser().getFullName());
        r.setSpecialization(a.getDoctor().getSpecialization());
        r.setAppointmentDateTime(a.getAppointmentDateTime().toString());
        r.setStatus(a.getStatus().name());
        r.setSymptoms(a.getSymptoms());
        r.setNotes(a.getNotes());
        return r;
    }
}