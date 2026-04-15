package com.example.hospital_backend.service.impl;

import com.example.hospital_backend.dto.request.LabTestOrderRequest;
import com.example.hospital_backend.dto.response.LabTestResponse;
import com.example.hospital_backend.entity.*;
import com.example.hospital_backend.enums.LabTestStatus;
import com.example.hospital_backend.enums.NotificationType;
import com.example.hospital_backend.exception.ForbiddenException;
import com.example.hospital_backend.exception.ResourceNotFoundException;
import com.example.hospital_backend.repository.*;
import com.example.hospital_backend.service.EmailService;
import com.example.hospital_backend.service.FileStorageService;
import com.example.hospital_backend.service.LabTestService;
import com.example.hospital_backend.service.NotificationService;
import org.springframework.core.io.Resource;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LabTestServiceImpl implements LabTestService {

    private final LabTestRepository labTestRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final FileStorageService fileStorageService;

    private final NotificationService notificationService;
    private final EmailService emailService;

    public LabTestServiceImpl(LabTestRepository labTestRepository,
            AppointmentRepository appointmentRepository,
            UserRepository userRepository,
            DoctorRepository doctorRepository,
            PatientRepository patientRepository,
            FileStorageService fileStorageService,
            NotificationService notificationService,
            EmailService emailService) {
        this.labTestRepository = labTestRepository;
        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.fileStorageService = fileStorageService;
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
    public LabTestResponse orderAsMyDoctor(LabTestOrderRequest request) {
        Doctor doctor = currentDoctor();

        if (!Boolean.TRUE.equals(doctor.getApproved())) {
            throw new ForbiddenException("Doctor is not approved by admin");
        }

        Appointment appt = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (!appt.getDoctor().getId().equals(doctor.getId())) {
            throw new ForbiddenException("You cannot order test for another doctor's appointment");
        }

        LabTest test = new LabTest();
        test.setAppointment(appt);
        test.setPatient(appt.getPatient());
        test.setDoctor(appt.getDoctor());
        test.setTestName(request.getTestName());
        test.setInstructions(request.getInstructions());
        test.setStatus(LabTestStatus.ORDERED);

        LabTest saved = labTestRepository.save(test);

        // notify patient
        notifyAndEmail(saved.getPatient().getUser().getId(), NotificationType.LAB,
                "Lab Test Ordered",
                "A lab test (" + saved.getTestName() + ") has been ordered for your appointment.");

        return map(saved);
    }

    @Override
    public List<LabTestResponse> myPatientLabTests() {
        Patient p = currentPatient();
        return labTestRepository.findByPatientIdOrderByCreatedAtDesc(p.getId())
                .stream().map(this::map).collect(Collectors.toList());
    }

    @Override
    public List<LabTestResponse> myDoctorLabTests() {
        Doctor d = currentDoctor();
        return labTestRepository.findByDoctorIdOrderByCreatedAtDesc(d.getId())
                .stream().map(this::map).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public LabTestResponse updateResultAsStaff(Long labTestId, String status, String resultText,
            MultipartFile reportFile) {
        LabTest test = labTestRepository.findById(labTestId)
                .orElseThrow(() -> new ResourceNotFoundException("Lab test not found"));

        if (status != null && !status.isBlank()) {
            test.setStatus(LabTestStatus.valueOf(status.toUpperCase()));
        }

        if (resultText != null) {
            test.setResultText(resultText);
        }

        if (reportFile != null && !reportFile.isEmpty()) {
            String path = fileStorageService.store(reportFile, "lab-reports");
            test.setReportFilePath(path);
        }

        LabTest saved = labTestRepository.save(test);

        // notify patient when completed
        if (saved.getStatus() == LabTestStatus.COMPLETED) {
            notifyAndEmail(saved.getPatient().getUser().getId(), NotificationType.LAB,
                    "Lab Report Ready",
                    "Your lab report for test (" + saved.getTestName() + ") is ready. You can view/download it.");
        }

        return map(saved);
    }

    @Override
    public LabTestResponse getByIdForCurrentUser(Long labTestId) {
        LabTest test = labTestRepository.findById(labTestId)
                .orElseThrow(() -> new ResourceNotFoundException("Lab test not found"));

        authorize(test);
        return map(test);
    }

    @Override
    public Resource downloadReport(Long labTestId) {
        LabTest test = labTestRepository.findById(labTestId)
                .orElseThrow(() -> new ResourceNotFoundException("Lab test not found"));

        authorize(test);

        if (test.getReportFilePath() == null || test.getReportFilePath().isBlank()) {
            throw new ResourceNotFoundException("Report file not uploaded");
        }

        return fileStorageService.loadAsResource(test.getReportFilePath());
    }

    private void authorize(LabTest test) {
        User u = currentUser();
        String role = u.getRole().name();

        if ("ADMIN".equals(role) || "STAFF".equals(role))
            return;

        if ("PATIENT".equals(role)) {
            Patient p = currentPatient();
            if (!test.getPatient().getId().equals(p.getId())) {
                throw new ForbiddenException("You cannot access another patient's lab test");
            }
        }

        if ("DOCTOR".equals(role)) {
            Doctor d = currentDoctor();
            if (!test.getDoctor().getId().equals(d.getId())) {
                throw new ForbiddenException("You cannot access another doctor's lab test");
            }
        }
    }

    private LabTestResponse map(LabTest t) {
        LabTestResponse r = new LabTestResponse();
        r.setId(t.getId());
        r.setAppointmentId(t.getAppointment().getId());

        r.setPatientId(t.getPatient().getId());
        r.setPatientName(t.getPatient().getUser().getFullName());

        r.setDoctorId(t.getDoctor().getId());
        r.setDoctorName(t.getDoctor().getUser().getFullName());

        r.setTestName(t.getTestName());
        r.setInstructions(t.getInstructions());
        r.setStatus(t.getStatus().name());
        r.setResultText(t.getResultText());

        r.setReportDownloadUrl("/api/v1/lab-tests/" + t.getId() + "/download");
        r.setCreatedAt(t.getCreatedAt() != null ? t.getCreatedAt().toString() : null);
        r.setUpdatedAt(t.getUpdatedAt() != null ? t.getUpdatedAt().toString() : null);

        return r;
    }
}