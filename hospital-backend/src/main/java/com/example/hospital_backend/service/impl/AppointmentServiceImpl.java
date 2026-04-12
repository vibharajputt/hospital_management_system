package com.example.hospital_backend.service.impl;

import com.example.hospital_backend.dto.request.AppointmentRequest;
import com.example.hospital_backend.dto.request.AppointmentStatusUpdateRequest;
import com.example.hospital_backend.dto.request.BookAppointmentRequest;
import com.example.hospital_backend.dto.response.AppointmentResponse;
import com.example.hospital_backend.dto.response.PageResponse;
import com.example.hospital_backend.entity.Appointment;
import com.example.hospital_backend.entity.Doctor;
import com.example.hospital_backend.entity.Patient;
import com.example.hospital_backend.entity.User;
import com.example.hospital_backend.enums.AppointmentStatus;
import com.example.hospital_backend.exception.ConflictException;
import com.example.hospital_backend.exception.ForbiddenException;
import com.example.hospital_backend.exception.ResourceNotFoundException;
import com.example.hospital_backend.repository.AppointmentRepository;
import com.example.hospital_backend.repository.DoctorRepository;
import com.example.hospital_backend.repository.PatientRepository;
import com.example.hospital_backend.repository.UserRepository;
import com.example.hospital_backend.service.AppointmentService;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;

    public AppointmentServiceImpl(AppointmentRepository appointmentRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            UserRepository userRepository) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.userRepository = userRepository;
    }

    private String currentEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    private Patient currentPatient() {
        User u = userRepository.findByEmail(currentEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return patientRepository.findByUserId(u.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));
    }

    private Doctor currentDoctor() {
        User u = userRepository.findByEmail(currentEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return doctorRepository.findByUserId(u.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));
    }

    @Override
    @Transactional
    public AppointmentResponse bookSelf(BookAppointmentRequest request) {
        Patient patient = currentPatient();
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        LocalDateTime dt = LocalDateTime.parse(request.getAppointmentDateTime());

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
            throw new ConflictException("This slot is already booked for the doctor");
        }
    }

    // keep old admin-style booking
    @Override
    @Transactional
    public AppointmentResponse book(AppointmentRequest request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        LocalDateTime dt = LocalDateTime.parse(request.getAppointmentDateTime());

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
    public List<AppointmentResponse> getMyPatientAppointments() {
        Patient p = currentPatient();
        return appointmentRepository.findByPatientId(p.getId()).stream().map(this::map).collect(Collectors.toList());
    }

    @Override
    public List<AppointmentResponse> getMyDoctorAppointments() {
        Doctor d = currentDoctor();
        return appointmentRepository.findByDoctorId(d.getId()).stream().map(this::map).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AppointmentResponse updateStatusAsMyDoctor(Long appointmentId, AppointmentStatusUpdateRequest request) {
        Doctor doctor = currentDoctor();

        if (!Boolean.TRUE.equals(doctor.getApproved())) {
            throw new ForbiddenException("Doctor is not approved by admin");
        }

        Appointment a = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (!a.getDoctor().getId().equals(doctor.getId())) {
            throw new ForbiddenException("You cannot update status for another doctor's appointment");
        }

        a.setStatus(AppointmentStatus.valueOf(request.getStatus().toUpperCase()));
        return map(appointmentRepository.save(a));
    }

    // admin-only use
    @Override
    @Transactional
    public AppointmentResponse updateStatus(Long appointmentId, AppointmentStatusUpdateRequest request) {
        Appointment a = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        a.setStatus(AppointmentStatus.valueOf(request.getStatus().toUpperCase()));
        return map(appointmentRepository.save(a));
    }

    @Override
    @Transactional
    public AppointmentResponse reschedule(Long appointmentId, AppointmentRequest request) {
        Appointment old = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        // Only the same patient can reschedule (ownership)
        Patient me = currentPatient();
        if (!old.getPatient().getId().equals(me.getId())) {
            throw new ForbiddenException("You cannot reschedule another patient's appointment");
        }

        old.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(old);

        BookAppointmentRequest newReq = new BookAppointmentRequest();
        newReq.setDoctorId(old.getDoctor().getId());
        newReq.setAppointmentDateTime(request.getAppointmentDateTime());
        newReq.setSymptoms(request.getSymptoms());
        newReq.setNotes(request.getNotes());

        return bookSelf(newReq);
    }

    @Override
    @Transactional
    public AppointmentResponse cancel(Long appointmentId) {
        Appointment a = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        // Only same patient can cancel
        Patient me = currentPatient();
        if (!a.getPatient().getId().equals(me.getId())) {
            throw new ForbiddenException("You cannot cancel another patient's appointment");
        }

        a.setStatus(AppointmentStatus.CANCELLED);
        return map(appointmentRepository.save(a));
    }

    @Override
    public PageResponse<AppointmentResponse> searchPaged(Long doctorId, Long patientId, String status,
            String from, String to, int page, int size,
            String sortBy, String direction) {
        Sort sort = "desc".equalsIgnoreCase(direction)
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        PageRequest pageable = PageRequest.of(page, size, sort);

        AppointmentStatus st = (status == null || status.isBlank()) ? null
                : AppointmentStatus.valueOf(status.toUpperCase());
        LocalDateTime fromDt = (from == null || from.isBlank()) ? null : LocalDateTime.parse(from);
        LocalDateTime toDt = (to == null || to.isBlank()) ? null : LocalDateTime.parse(to);

        Page<Appointment> result = appointmentRepository.searchAppointments(doctorId, patientId, st, fromDt, toDt,
                pageable);

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