package com.example.hospital_backend.controller;

import com.example.hospital_backend.dto.request.PatientProfileRequest;
import com.example.hospital_backend.entity.Patient;
import com.example.hospital_backend.entity.User;
import com.example.hospital_backend.repository.PatientRepository;
import com.example.hospital_backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/patients")
@CrossOrigin(origins = "*")
public class PatientController {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    public PatientController(PatientRepository patientRepository, UserRepository userRepository) {
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/profile")
    public ResponseEntity<?> createPatientProfile(@RequestBody PatientProfileRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (patientRepository.findByUserId(user.getId()).isPresent()) {
            return ResponseEntity.badRequest().body("Patient profile already exists");
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

        return ResponseEntity.ok(patientRepository.save(patient));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getPatientProfile(@PathVariable Long userId) {
        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Patient profile not found"));
        return ResponseEntity.ok(patient);
    }
}