package com.example.hospital_backend.service.impl;

import com.example.hospital_backend.dto.request.PatientProfileRequest;
import com.example.hospital_backend.dto.response.PatientResponse;
import com.example.hospital_backend.dto.response.UserSummaryResponse;
import com.example.hospital_backend.entity.Patient;
import com.example.hospital_backend.entity.User;
import com.example.hospital_backend.exception.ConflictException;
import com.example.hospital_backend.exception.ResourceNotFoundException;
import com.example.hospital_backend.repository.PatientRepository;
import com.example.hospital_backend.repository.UserRepository;
import com.example.hospital_backend.service.PatientService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    public PatientServiceImpl(PatientRepository patientRepository, UserRepository userRepository) {
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
    }

    @Override
    public PatientResponse createPatientProfile(PatientProfileRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (patientRepository.findByUserId(user.getId()).isPresent()) {
            throw new ConflictException("Patient profile already exists");
        }

        Patient patient = new Patient();
        patient.setUser(user);
        patient.setBloodGroup(request.getBloodGroup());
        patient.setAllergies(request.getAllergies());
        patient.setChronicConditions(request.getChronicConditions());
        patient.setEmergencyContactName(request.getEmergencyContactName());
        patient.setEmergencyContactPhone(request.getEmergencyContactPhone());
        patient.setInsuranceProvider(request.getInsuranceProvider());
        patient.setInsuranceNumber(request.getInsuranceNumber());

        return mapPatient(patientRepository.save(patient));
    }

    @Override
    public PatientResponse getPatientProfileByUserId(Long userId) {
        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));
        return mapPatient(patient);
    }

    @Override
    public List<PatientResponse> getAllPatients() {
        return patientRepository.findAll().stream()
                .map(this::mapPatient)
                .collect(Collectors.toList());
    }

    private PatientResponse mapPatient(Patient p) {
        PatientResponse r = new PatientResponse();
        r.setId(p.getId());

        r.setUser(new UserSummaryResponse(
                p.getUser().getId(),
                p.getUser().getFullName(),
                p.getUser().getEmail(),
                p.getUser().getPhone(),
                p.getUser().getRole().name()));

        r.setBloodGroup(p.getBloodGroup());
        r.setAllergies(p.getAllergies());
        r.setChronicConditions(p.getChronicConditions());
        r.setEmergencyContactName(p.getEmergencyContactName());
        r.setEmergencyContactPhone(p.getEmergencyContactPhone());
        r.setInsuranceProvider(p.getInsuranceProvider());
        r.setInsuranceNumber(p.getInsuranceNumber());

        return r;
    }
}