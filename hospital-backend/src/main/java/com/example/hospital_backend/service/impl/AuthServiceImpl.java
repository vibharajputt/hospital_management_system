package com.example.hospital_backend.service.impl;

import com.example.hospital_backend.dto.request.LoginRequest;
import com.example.hospital_backend.dto.request.RegisterRequest;
import com.example.hospital_backend.dto.response.AuthResponse;
import com.example.hospital_backend.entity.Doctor;
import com.example.hospital_backend.entity.Patient;
import com.example.hospital_backend.entity.User;
import com.example.hospital_backend.enums.Role;
import com.example.hospital_backend.exception.BadRequestException;
import com.example.hospital_backend.exception.ResourceAlreadyExistsException;
import com.example.hospital_backend.repository.DoctorRepository;
import com.example.hospital_backend.repository.PatientRepository;
import com.example.hospital_backend.repository.UserRepository;
import com.example.hospital_backend.security.JwtUtil;
import com.example.hospital_backend.service.AuthService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    public AuthServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil,
                           PatientRepository patientRepository, DoctorRepository doctorRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResourceAlreadyExistsException("Email already registered");
        }

        if (userRepository.existsByPhone(request.getPhone())) {
            throw new ResourceAlreadyExistsException("Phone already registered");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setIsVerified(true);
        user.setIsActive(true);

        User savedUser = userRepository.save(user);

        // Auto-create Patient profile for PATIENT role
        if (savedUser.getRole() == Role.PATIENT) {
            if (patientRepository.findByUserId(savedUser.getId()).isEmpty()) {
                Patient p = new Patient();
                p.setUser(savedUser);
                patientRepository.save(p);
            }
        }

        // Auto-create Doctor profile for DOCTOR role
        if (savedUser.getRole() == Role.DOCTOR) {
            if (doctorRepository.findByUserId(savedUser.getId()).isEmpty()) {
                Doctor d = new Doctor();
                d.setUser(savedUser);
                d.setSpecialization("General");
                d.setQualification("MBBS");
                d.setExperienceYears(0);
                d.setLicenseNumber("PENDING");
                d.setConsultationFee(500.0);
                d.setHospitalName("City Hospital");
                d.setDepartment("General");
                d.setApproved(false);
                doctorRepository.save(d);
            }
        }

        String token = jwtUtil.generateToken(savedUser.getEmail());

        return new AuthResponse(
                token,
                savedUser.getId(),
                savedUser.getFullName(),
                savedUser.getEmail(),
                savedUser.getRole());
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }

        // Auto-create Patient profile if missing (for users registered before this fix)
        if (user.getRole() == Role.PATIENT) {
            if (patientRepository.findByUserId(user.getId()).isEmpty()) {
                Patient p = new Patient();
                p.setUser(user);
                patientRepository.save(p);
            }
        }

        // Auto-create Doctor profile if missing
        if (user.getRole() == Role.DOCTOR) {
            if (doctorRepository.findByUserId(user.getId()).isEmpty()) {
                Doctor d = new Doctor();
                d.setUser(user);
                d.setSpecialization("General");
                d.setQualification("MBBS");
                d.setExperienceYears(0);
                d.setLicenseNumber("PENDING");
                d.setConsultationFee(500.0);
                d.setHospitalName("City Hospital");
                d.setDepartment("General");
                d.setApproved(false);
                doctorRepository.save(d);
            }
        }

        String token = jwtUtil.generateToken(user.getEmail());

        return new AuthResponse(
                token,
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole());
    }
}