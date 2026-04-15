package com.example.hospital_backend.service.impl;

import com.example.hospital_backend.dto.request.AppointmentRequest;
import com.example.hospital_backend.dto.request.AppointmentStatusUpdateRequest;
import com.example.hospital_backend.dto.request.BookAppointmentRequest;
import com.example.hospital_backend.dto.response.AppointmentResponse;
import com.example.hospital_backend.dto.response.PageResponse;
import com.example.hospital_backend.entity.*;
import com.example.hospital_backend.enums.AppointmentStatus;
import com.example.hospital_backend.enums.NotificationType;
import com.example.hospital_backend.exception.ConflictException;
import com.example.hospital_backend.exception.ForbiddenException;
import com.example.hospital_backend.exception.ResourceNotFoundException;
import com.example.hospital_backend.repository.*;
import com.example.hospital_backend.service.AppointmentService;
import com.example.hospital_backend.service.EmailService;
import com.example.hospital_backend.service.NotificationService;
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

    private final NotificationService notificationService;
    private final EmailService emailService;

    public AppointmentServiceImpl(AppointmentRepository appointmentRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            UserRepository userRepository,
            NotificationService notificationService,
            EmailService emailService) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.emailService = emailService;
    }

    private String currentEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    private User currentUser() {
        return userRepository.findByEmail(currentEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Patient currentPatient() {
        User u = currentUser();
        return patientRepository.findByUserId(u.getId())
                .orElseGet(() -> {
                    Patient p = new Patient();
                    p.setUser(u);
                    return patientRepository.save(p);
                });
    }

    private Doctor currentDoctor() {
        User u = currentUser();
        return doctorRepository.findByUserId(u.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));
    }

    private void notifyAndEmail(Long userId, NotificationType type, String title, String message) {
        try {
            notificationService.create(userId, type, title, message);
        } catch (Exception ignored) {
        }

        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user != null && user.getEmail() != null) {
                emailService.sendEmail(user.getEmail(), title, message);
            }
        } catch (Exception ignored) {
        }
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

            Appointment saved = appointmentRepository.save(a);

            // Notify patient + doctor
            String patientTitle = "Appointment Booked";
            String patientMsg = "Your appointment is booked with Dr. " + doctor.getUser().getFullName()
                    + " at " + dt + ".";
            notifyAndEmail(patient.getUser().getId(), NotificationType.APPOINTMENT, patientTitle, patientMsg);

            String doctorTitle = "New Appointment Booked";
            String doctorMsg = "New appointment booked by " + patient.getUser().getFullName()
                    + " at " + dt + ".";
            notifyAndEmail(doctor.getUser().getId(), NotificationType.APPOINTMENT, doctorTitle, doctorMsg);

            return map(saved);

        } catch (DataIntegrityViolationException e) {
            throw new ConflictException("This slot is already booked for the doctor");
        }
    }

    // Admin booking (kept)
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

            Appointment saved = appointmentRepository.save(a);

            notifyAndEmail(patient.getUser().getId(), NotificationType.APPOINTMENT,
                    "Appointment Booked",
                    "Your appointment is booked with Dr. " + doctor.getUser().getFullName() + " at " + dt);

            notifyAndEmail(doctor.getUser().getId(), NotificationType.APPOINTMENT,
                    "New Appointment Booked",
                    "New appointment booked by " + patient.getUser().getFullName() + " at " + dt);

            return map(saved);

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

        AppointmentStatus newStatus = AppointmentStatus.valueOf(request.getStatus().toUpperCase());
        a.setStatus(newStatus);

        Appointment saved = appointmentRepository.save(a);

        // Notify patient about status change
        String title = "Appointment Status Updated";
        String msg = "Your appointment (" + saved.getAppointmentDateTime() + ") status changed to: " + newStatus.name();
        notifyAndEmail(saved.getPatient().getUser().getId(), NotificationType.APPOINTMENT, title, msg);

        return map(saved);
    }

    // Admin-only use
    @Override
    @Transactional
    public AppointmentResponse updateStatus(Long appointmentId, AppointmentStatusUpdateRequest request) {
        Appointment a = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        AppointmentStatus newStatus = AppointmentStatus.valueOf(request.getStatus().toUpperCase());
        a.setStatus(newStatus);

        Appointment saved = appointmentRepository.save(a);

        notifyAndEmail(saved.getPatient().getUser().getId(), NotificationType.APPOINTMENT,
                "Appointment Status Updated",
                "Your appointment (" + saved.getAppointmentDateTime() + ") status changed to: " + newStatus.name());

        return map(saved);
    }

    @Override
    @Transactional
    public AppointmentResponse reschedule(Long appointmentId, AppointmentRequest request) {
        Appointment old = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        Patient me = currentPatient();
        if (!old.getPatient().getId().equals(me.getId())) {
            throw new ForbiddenException("You cannot reschedule another patient's appointment");
        }

        // cancel old
        old.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(old);

        // book new
        BookAppointmentRequest newReq = new BookAppointmentRequest();
        newReq.setDoctorId(old.getDoctor().getId());
        newReq.setAppointmentDateTime(request.getAppointmentDateTime());
        newReq.setSymptoms(request.getSymptoms());
        newReq.setNotes(request.getNotes());

        AppointmentResponse newAppt = bookSelf(newReq);

        // Notify doctor about reschedule
        notifyAndEmail(old.getDoctor().getUser().getId(), NotificationType.APPOINTMENT,
                "Appointment Rescheduled",
                "Appointment rescheduled by " + me.getUser().getFullName() + ". New time: "
                        + request.getAppointmentDateTime());

        return newAppt;
    }

    @Override
    @Transactional
    public AppointmentResponse cancel(Long appointmentId) {
        Appointment a = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        Patient me = currentPatient();
        if (!a.getPatient().getId().equals(me.getId())) {
            throw new ForbiddenException("You cannot cancel another patient's appointment");
        }

        a.setStatus(AppointmentStatus.CANCELLED);
        Appointment saved = appointmentRepository.save(a);

        // Notify doctor + patient
        notifyAndEmail(me.getUser().getId(), NotificationType.APPOINTMENT,
                "Appointment Cancelled",
                "Your appointment at " + saved.getAppointmentDateTime() + " has been cancelled.");

        notifyAndEmail(saved.getDoctor().getUser().getId(), NotificationType.APPOINTMENT,
                "Appointment Cancelled",
                "Appointment at " + saved.getAppointmentDateTime() + " was cancelled by " + me.getUser().getFullName()
                        + ".");

        return map(saved);
    }

    @Override
    public PageResponse<AppointmentResponse> searchPaged(Long doctorId, Long patientId, String status,
            String from, String to, int page, int size,
            String sortBy, String direction) {
        Sort sort = "desc".equalsIgnoreCase(direction) ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        PageRequest pageable = PageRequest.of(page, size, sort);

        AppointmentStatus st = (status == null || status.isBlank()) ? null
                : AppointmentStatus.valueOf(status.toUpperCase());
        LocalDateTime fromDt = (from == null || from.isBlank()) ? null : LocalDateTime.parse(from);
        LocalDateTime toDt = (to == null || to.isBlank()) ? null : LocalDateTime.parse(to);

        Page<Appointment> result = appointmentRepository.searchAppointments(doctorId, patientId, st, fromDt, toDt,
                pageable);

        List<AppointmentResponse> content = result.getContent().stream().map(this::map).collect(Collectors.toList());

        return new PageResponse<>(content, result.getNumber(), result.getSize(), result.getTotalElements(),
                result.getTotalPages(), result.isLast());
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