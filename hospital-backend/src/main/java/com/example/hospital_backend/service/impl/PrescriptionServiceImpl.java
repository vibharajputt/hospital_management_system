package com.example.hospital_backend.service.impl;

import com.example.hospital_backend.dto.request.PrescriptionItemRequest;
import com.example.hospital_backend.dto.request.PrescriptionRequest;
import com.example.hospital_backend.dto.response.PrescriptionItemResponse;
import com.example.hospital_backend.dto.response.PrescriptionResponse;
import com.example.hospital_backend.entity.*;
import com.example.hospital_backend.enums.NotificationType;
import com.example.hospital_backend.exception.ConflictException;
import com.example.hospital_backend.exception.ForbiddenException;
import com.example.hospital_backend.exception.ResourceNotFoundException;
import com.example.hospital_backend.repository.*;
import com.example.hospital_backend.service.EmailService;
import com.example.hospital_backend.service.NotificationService;
import com.example.hospital_backend.service.PrescriptionService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PrescriptionServiceImpl implements PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;

    private final NotificationService notificationService;
    private final EmailService emailService;

    public PrescriptionServiceImpl(PrescriptionRepository prescriptionRepository,
            AppointmentRepository appointmentRepository,
            UserRepository userRepository,
            DoctorRepository doctorRepository,
            PatientRepository patientRepository,
            NotificationService notificationService,
            EmailService emailService) {
        this.prescriptionRepository = prescriptionRepository;
        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
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

    private Doctor currentDoctor() {
        User u = currentUser();
        return doctorRepository.findByUserId(u.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));
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
    public PrescriptionResponse createPrescriptionAsMyDoctor(PrescriptionRequest request) {
        Doctor doctor = currentDoctor();

        if (!Boolean.TRUE.equals(doctor.getApproved())) {
            throw new ForbiddenException("Doctor is not approved by admin");
        }

        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (!appointment.getDoctor().getId().equals(doctor.getId())) {
            throw new ForbiddenException("You cannot write prescription for another doctor's appointment");
        }

        if (prescriptionRepository.findByAppointmentId(appointment.getId()).isPresent()) {
            throw new ConflictException("Prescription already exists for this appointment");
        }

        Prescription prescription = new Prescription();
        prescription.setAppointment(appointment);
        prescription.setDoctor(doctor);
        prescription.setPatient(appointment.getPatient());
        prescription.setDiagnosis(request.getDiagnosis());
        prescription.setNotes(request.getNotes());

        if (request.getItems() != null) {
            for (PrescriptionItemRequest itemReq : request.getItems()) {
                PrescriptionItem item = new PrescriptionItem();
                item.setMedicineName(itemReq.getMedicineName());
                item.setDosage(itemReq.getDosage());
                item.setFrequency(itemReq.getFrequency());
                item.setDuration(itemReq.getDuration());
                item.setInstructions(itemReq.getInstructions());
                prescription.addItem(item);
            }
        }

        Prescription saved = prescriptionRepository.save(prescription);

        // Trigger notification + email to patient
        Long patientUserId = saved.getPatient().getUser().getId();
        String title = "New Prescription Added";
        String msg = "Dr. " + saved.getDoctor().getUser().getFullName()
                + " has added a prescription for your appointment (ID: " + saved.getAppointment().getId() + ").";
        notifyAndEmail(patientUserId, NotificationType.PRESCRIPTION, title, msg);

        return map(saved);
    }

    @Override
    public List<PrescriptionResponse> getMyPatientPrescriptions() {
        Patient patient = currentPatient();
        return prescriptionRepository.findByPatientIdOrderByCreatedAtDesc(patient.getId())
                .stream().map(this::map).collect(Collectors.toList());
    }

    @Override
    public List<PrescriptionResponse> getMyDoctorPrescriptions() {
        Doctor doctor = currentDoctor();
        return prescriptionRepository.findByDoctorIdOrderByCreatedAtDesc(doctor.getId())
                .stream().map(this::map).collect(Collectors.toList());
    }

    @Override
    public PrescriptionResponse getByIdForCurrentUser(Long id) {
        Prescription p = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found"));

        authorizeAccess(p);
        return map(p);
    }

    @Override
    public PrescriptionResponse getByAppointmentForCurrentUser(Long appointmentId) {
        Prescription p = prescriptionRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found"));

        authorizeAccess(p);
        return map(p);
    }

    private void authorizeAccess(Prescription p) {
        User u = currentUser();
        String role = u.getRole().name();

        if ("ADMIN".equals(role))
            return;

        if ("PATIENT".equals(role)) {
            Patient patient = currentPatient();
            if (!p.getPatient().getId().equals(patient.getId())) {
                throw new ForbiddenException("You cannot access another patient's prescription");
            }
        }

        if ("DOCTOR".equals(role)) {
            Doctor doctor = currentDoctor();
            if (!p.getDoctor().getId().equals(doctor.getId())) {
                throw new ForbiddenException("You cannot access another doctor's prescription");
            }
        }
    }

    private PrescriptionResponse map(Prescription p) {
        PrescriptionResponse r = new PrescriptionResponse();
        r.setId(p.getId());
        r.setAppointmentId(p.getAppointment().getId());

        r.setPatientId(p.getPatient().getId());
        r.setPatientName(p.getPatient().getUser().getFullName());

        r.setDoctorId(p.getDoctor().getId());
        r.setDoctorName(p.getDoctor().getUser().getFullName());

        r.setDiagnosis(p.getDiagnosis());
        r.setNotes(p.getNotes());
        r.setCreatedAt(p.getCreatedAt() != null ? p.getCreatedAt().toString() : null);

        List<PrescriptionItemResponse> items = p.getItems().stream().map(it -> {
            PrescriptionItemResponse ir = new PrescriptionItemResponse();
            ir.setId(it.getId());
            ir.setMedicineName(it.getMedicineName());
            ir.setDosage(it.getDosage());
            ir.setFrequency(it.getFrequency());
            ir.setDuration(it.getDuration());
            ir.setInstructions(it.getInstructions());
            return ir;
        }).collect(Collectors.toList());

        r.setItems(items);
        return r;
    }
}