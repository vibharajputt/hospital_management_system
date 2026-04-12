package com.example.hospital_backend.config;

import com.example.hospital_backend.entity.Doctor;
import com.example.hospital_backend.entity.Patient;
import com.example.hospital_backend.entity.User;
import com.example.hospital_backend.enums.Role;
import com.example.hospital_backend.repository.DoctorRepository;
import com.example.hospital_backend.repository.PatientRepository;
import com.example.hospital_backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedData(UserRepository userRepository,
            DoctorRepository doctorRepository,
            PatientRepository patientRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {

            // ADMIN
            seedUserIfNotExists(userRepository, passwordEncoder,
                    "Admin", "admin@gmail.com", "9000000000", "admin123", Role.ADMIN);

            // STAFF
            seedUserIfNotExists(userRepository, passwordEncoder,
                    "Staff", "staff@gmail.com", "9111111111", "staff123", Role.STAFF);

            // DOCTOR user
            User doctorUser = seedUserIfNotExists(userRepository, passwordEncoder,
                    "Dr Amit Sharma", "doctor@gmail.com", "8888888888", "doctor123", Role.DOCTOR);

            // PATIENT user
            User patientUser = seedUserIfNotExists(userRepository, passwordEncoder,
                    "Rahul Kumar", "patient@gmail.com", "9876543210", "patient123", Role.PATIENT);

            // Doctor profile
            doctorRepository.findByUserId(doctorUser.getId()).orElseGet(() -> {
                Doctor d = new Doctor();
                d.setUser(doctorUser);
                d.setSpecialization("Cardiologist");
                d.setQualification("MBBS, MD");
                d.setExperienceYears(10);
                d.setLicenseNumber("DOC12345");
                d.setConsultationFee(800.0);
                d.setHospitalName("City Hospital");
                d.setDepartment("Cardiology");
                d.setApproved(true); // auto-approved for dev
                return doctorRepository.save(d);
            });

            // Patient profile
            patientRepository.findByUserId(patientUser.getId()).orElseGet(() -> {
                Patient p = new Patient();
                p.setUser(patientUser);
                p.setBloodGroup("O+");
                p.setAllergies("Dust");
                p.setChronicConditions("Asthma");
                p.setEmergencyContactName("Ramesh Kumar");
                p.setEmergencyContactPhone("9999999999");
                p.setInsuranceProvider("Demo Insurance");
                p.setInsuranceNumber("INS123");
                return patientRepository.save(p);
            });

            System.out.println("Seeder completed: admin/staff/doctor/patient created (if not already).");
        };
    }

    private User seedUserIfNotExists(UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            String fullName,
            String email,
            String phone,
            String rawPassword,
            Role role) {

        return userRepository.findByEmail(email).orElseGet(() -> {
            User u = new User();
            u.setFullName(fullName);
            u.setEmail(email);
            u.setPhone(phone);
            u.setPassword(passwordEncoder.encode(rawPassword));
            u.setRole(role);
            u.setIsVerified(true);
            u.setIsActive(true);
            return userRepository.save(u);
        });
    }
}