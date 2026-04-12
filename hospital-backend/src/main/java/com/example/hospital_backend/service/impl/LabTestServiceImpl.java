package com.example.hospital_backend.service.impl;

import com.example.hospital_backend.dto.request.LabTestOrderRequest;
import com.example.hospital_backend.dto.response.LabTestResponse;
import com.example.hospital_backend.entity.*;
import com.example.hospital_backend.enums.LabTestStatus;
import com.example.hospital_backend.exception.ForbiddenException;
import com.example.hospital_backend.exception.ResourceNotFoundException;
import com.example.hospital_backend.repository.*;
import com.example.hospital_backend.service.FileStorageService;
import com.example.hospital_backend.service.LabTestService;
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

    public LabTestServiceImpl(LabTestRepository labTestRepository,
            AppointmentRepository appointmentRepository,
            UserRepository userRepository,
            DoctorRepository doctorRepository,
            PatientRepository patientRepository,
            FileStorageService fileStorageService) {
        this.labTestRepository = labTestRepository;
        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.fileStorageService = fileStorageService;
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
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));
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

        return map(labTestRepository.save(test));
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

        return map(labTestRepository.save(test));
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