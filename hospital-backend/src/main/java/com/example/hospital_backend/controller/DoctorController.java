package com.example.hospital_backend.controller;

import com.example.hospital_backend.dto.request.DoctorProfileRequest;
import com.example.hospital_backend.entity.Doctor;
import com.example.hospital_backend.entity.User;
import com.example.hospital_backend.repository.DoctorRepository;
import com.example.hospital_backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/doctors")
@CrossOrigin(origins = "*")
public class DoctorController {

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;

    public DoctorController(DoctorRepository doctorRepository, UserRepository userRepository) {
        this.doctorRepository = doctorRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/profile")
    public ResponseEntity<?> createDoctorProfile(@RequestBody DoctorProfileRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (doctorRepository.findByUserId(user.getId()).isPresent()) {
            return ResponseEntity.badRequest().body("Doctor profile already exists");
        }

        Doctor doctor = new Doctor();
        doctor.setUser(user);
        doctor.setSpecialization(request.getSpecialization());
        doctor.setQualification(request.getQualification());
        doctor.setExperienceYears(request.getExperienceYears());
        doctor.setLicenseNumber(request.getLicenseNumber());
        doctor.setConsultationFee(request.getConsultationFee());
        doctor.setHospitalName(request.getHospitalName());
        doctor.setDepartment(request.getDepartment());

        return ResponseEntity.ok(doctorRepository.save(doctor));
    }

    @GetMapping
    public ResponseEntity<?> getAllDoctors() {
        return ResponseEntity.ok(doctorRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDoctorById(@PathVariable Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        return ResponseEntity.ok(doctor);
    }
}