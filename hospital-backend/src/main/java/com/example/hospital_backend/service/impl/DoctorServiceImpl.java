package com.example.hospital_backend.service.impl;

import com.example.hospital_backend.dto.request.DoctorProfileRequest;
import com.example.hospital_backend.dto.response.DoctorResponse;
import com.example.hospital_backend.dto.response.UserSummaryResponse;
import com.example.hospital_backend.entity.Doctor;
import com.example.hospital_backend.entity.User;
import com.example.hospital_backend.repository.DoctorRepository;
import com.example.hospital_backend.repository.UserRepository;
import com.example.hospital_backend.service.DoctorService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;

    public DoctorServiceImpl(DoctorRepository doctorRepository, UserRepository userRepository) {
        this.doctorRepository = doctorRepository;
        this.userRepository = userRepository;
    }

    @Override
    public DoctorResponse createDoctorProfile(DoctorProfileRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (doctorRepository.findByUserId(user.getId()).isPresent()) {
            throw new RuntimeException("Doctor profile already exists");
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

        return mapDoctor(doctorRepository.save(doctor));
    }

    @Override
    public List<DoctorResponse> getAllDoctors() {
        return doctorRepository.findAll().stream().map(this::mapDoctor).collect(Collectors.toList());
    }

    @Override
    public DoctorResponse getDoctorById(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        return mapDoctor(doctor);
    }

    @Override
    public List<DoctorResponse> searchBySpecialization(String specialization) {
        return doctorRepository.findBySpecializationContainingIgnoreCase(specialization)
                .stream().map(this::mapDoctor).collect(Collectors.toList());
    }

    private DoctorResponse mapDoctor(Doctor d) {
        DoctorResponse r = new DoctorResponse();
        r.setId(d.getId());

        r.setUser(new UserSummaryResponse(
                d.getUser().getId(),
                d.getUser().getFullName(),
                d.getUser().getEmail(),
                d.getUser().getPhone(),
                d.getUser().getRole().name()));

        r.setSpecialization(d.getSpecialization());
        r.setQualification(d.getQualification());
        r.setExperienceYears(d.getExperienceYears());
        r.setLicenseNumber(d.getLicenseNumber());
        r.setConsultationFee(d.getConsultationFee());
        r.setHospitalName(d.getHospitalName());
        r.setDepartment(d.getDepartment());

        return r;
    }
}