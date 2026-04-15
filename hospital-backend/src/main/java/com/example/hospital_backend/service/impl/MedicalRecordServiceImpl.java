package com.example.hospital_backend.service.impl;

import com.example.hospital_backend.dto.response.MedicalRecordResponse;
import com.example.hospital_backend.entity.Doctor;
import com.example.hospital_backend.entity.MedicalRecord;
import com.example.hospital_backend.entity.Patient;
import com.example.hospital_backend.entity.User;
import com.example.hospital_backend.enums.MedicalRecordType;
import com.example.hospital_backend.enums.Role;
import com.example.hospital_backend.exception.BadRequestException;
import com.example.hospital_backend.exception.ForbiddenException;
import com.example.hospital_backend.exception.ResourceNotFoundException;
import com.example.hospital_backend.repository.AppointmentRepository;
import com.example.hospital_backend.repository.DoctorRepository;
import com.example.hospital_backend.repository.MedicalRecordRepository;
import com.example.hospital_backend.repository.PatientRepository;
import com.example.hospital_backend.repository.UserRepository;
import com.example.hospital_backend.service.FileStorageService;
import com.example.hospital_backend.service.MedicalRecordService;
import org.springframework.core.io.Resource;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MedicalRecordServiceImpl implements MedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final FileStorageService fileStorageService;
    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;

    public MedicalRecordServiceImpl(MedicalRecordRepository medicalRecordRepository,
            FileStorageService fileStorageService,
            UserRepository userRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            AppointmentRepository appointmentRepository) {
        this.medicalRecordRepository = medicalRecordRepository;
        this.fileStorageService = fileStorageService;
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
    }

    private String currentEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getName() == null
                || "anonymousUser".equals(auth.getName())) {
            throw new ForbiddenException("Unauthorized");
        }
        return auth.getName();
    }

    private User currentUser() {
        return userRepository.findByEmail(currentEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Patient currentPatient() {
        User u = currentUser();
        if (u.getRole() != Role.PATIENT) {
            throw new ForbiddenException("Only PATIENT can access this endpoint");
        }
        return patientRepository.findByUserId(u.getId())
                .orElseGet(() -> {
                    Patient p = new Patient();
                    p.setUser(u);
                    return patientRepository.save(p);
                });
    }

    private Doctor currentDoctor() {
        User u = currentUser();
        if (u.getRole() != Role.DOCTOR) {
            throw new ForbiddenException("Only DOCTOR can access this endpoint");
        }
        return doctorRepository.findByUserId(u.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));
    }

    @Override
    public MedicalRecordResponse uploadMyRecord(MultipartFile file, String recordType, String title,
            String description) {
        Patient patient = currentPatient();

        String relativePath = fileStorageService.store(file, "medical-records");

        MedicalRecordType type;
        try {
            type = MedicalRecordType.valueOf(recordType.trim().toUpperCase());
        } catch (Exception e) {
            throw new BadRequestException("Invalid recordType: " + recordType);
        }

        MedicalRecord record = new MedicalRecord();
        record.setPatient(patient);
        record.setDoctor(null);
        record.setRecordType(type);
        record.setTitle(title);
        record.setDescription(description);
        record.setFilePath(relativePath);

        return map(medicalRecordRepository.save(record));
    }

    @Override
    public List<MedicalRecordResponse> getMyRecords() {
        Patient patient = currentPatient();
        return medicalRecordRepository.findByPatientIdOrderByCreatedAtDesc(patient.getId())
                .stream()
                .map(this::map)
                .collect(Collectors.toList());
    }

    @Override
    public List<MedicalRecordResponse> getPatientRecordsForDoctor(Long patientId) {
        User u = currentUser();

        // ADMIN: can view any patient's records
        if (u.getRole() == Role.ADMIN) {
            return medicalRecordRepository.findByPatientIdOrderByCreatedAtDesc(patientId)
                    .stream()
                    .map(this::map)
                    .collect(Collectors.toList());
        }

        // DOCTOR: must have appointment with patient
        Doctor doctor = currentDoctor();
        boolean allowed = appointmentRepository.existsByDoctorIdAndPatientId(doctor.getId(), patientId);
        if (!allowed) {
            throw new ForbiddenException("You are not allowed to view this patient's records");
        }

        return medicalRecordRepository.findByPatientIdOrderByCreatedAtDesc(patientId)
                .stream()
                .map(this::map)
                .collect(Collectors.toList());
    }

    @Override
    public Resource downloadRecord(Long recordId) {
        MedicalRecord record = medicalRecordRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("Medical record not found"));

        User u = currentUser();

        if (u.getRole() == Role.PATIENT) {
            Patient p = currentPatient();
            if (!record.getPatient().getId().equals(p.getId())) {
                throw new ForbiddenException("You cannot download another patient's record");
            }
        }

        if (u.getRole() == Role.DOCTOR) {
            Doctor d = doctorRepository.findByUserId(u.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));
            boolean allowed = appointmentRepository.existsByDoctorIdAndPatientId(
                    d.getId(), record.getPatient().getId());
            if (!allowed) {
                throw new ForbiddenException("You are not allowed to download this record");
            }
        }

        // ADMIN allowed by default
        return fileStorageService.loadAsResource(record.getFilePath());
    }

    private MedicalRecordResponse map(MedicalRecord r) {
        MedicalRecordResponse dto = new MedicalRecordResponse();
        dto.setId(r.getId());
        dto.setPatientId(r.getPatient().getId());
        dto.setDoctorId(r.getDoctor() != null ? r.getDoctor().getId() : null);
        dto.setRecordType(r.getRecordType().name());
        dto.setTitle(r.getTitle());
        dto.setDescription(r.getDescription());
        dto.setCreatedAt(r.getCreatedAt() != null ? r.getCreatedAt().toString() : null);
        dto.setDownloadUrl("/api/v1/medical-records/" + r.getId() + "/download");
        return dto;
    }
}