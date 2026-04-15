package com.example.hospital_backend.config;

import com.example.hospital_backend.entity.*;
import com.example.hospital_backend.enums.*;
import com.example.hospital_backend.repository.*;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedData(UserRepository userRepository,
            DoctorRepository doctorRepository,
            DoctorScheduleRepository doctorScheduleRepository,
            PatientRepository patientRepository,
            AppointmentRepository appointmentRepository,
            BillingRepository billingRepository,
            NotificationRepository notificationRepository,
            PrescriptionRepository prescriptionRepository,
            LabTestRepository labTestRepository,
            MedicalRecordRepository medicalRecordRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {

            // Ensure upload directories exist and have dummy files
            String dummyLabReport = initDummyFile("lab-reports", "dummy-lab-report.pdf");
            String dummyMedicalRecord = initDummyFile("medical-records", "dummy-medical-record.pdf");

            // ADMIN
            seedUserIfNotExists(userRepository, passwordEncoder,
                    "Admin", "admin@gmail.com", "9000000000", "admin123", Role.ADMIN);

            // STAFF
            seedUserIfNotExists(userRepository, passwordEncoder,
                    "Staff", "staff@gmail.com", "9111111111", "staff123", Role.STAFF);

            // DOCTORS List
            List<Doctor> allDoctors = new ArrayList<>();

            User docUser1 = seedUserIfNotExists(userRepository, passwordEncoder, "Dr Amit Sharma", "doctor@gmail.com", "8888888888", "doctor123", Role.DOCTOR);
            allDoctors.add(createDoctorProfileIfNotExists(doctorRepository, docUser1, "Cardiologist", "MBBS, MD", 10, "DOC12345", 800.0, "Cardiology"));

            User docUser2 = seedUserIfNotExists(userRepository, passwordEncoder, "Dr Sarah Jenkins", "sarah@gmail.com", "8888888881", "doctor123", Role.DOCTOR);
            allDoctors.add(createDoctorProfileIfNotExists(doctorRepository, docUser2, "Neurologist", "MD, FACC", 12, "DOC67890", 1200.0, "Neurology"));

            User docUser3 = seedUserIfNotExists(userRepository, passwordEncoder, "Dr Michael Chen", "michael@gmail.com", "8888888882", "doctor123", Role.DOCTOR);
            allDoctors.add(createDoctorProfileIfNotExists(doctorRepository, docUser3, "Pediatrician", "MBBS, MD", 8, "DOC11223", 600.0, "Pediatrics"));

            User docUser4 = seedUserIfNotExists(userRepository, passwordEncoder, "Dr Emily Davis", "emily@gmail.com", "8888888883", "doctor123", Role.DOCTOR);
            allDoctors.add(createDoctorProfileIfNotExists(doctorRepository, docUser4, "Dermatologist", "MBBS", 5, "DOC44556", 1000.0, "Dermatology"));

            User docUser5 = seedUserIfNotExists(userRepository, passwordEncoder, "Dr Raj Patel", "raj@gmail.com", "8888888884", "doctor123", Role.DOCTOR);
            allDoctors.add(createDoctorProfileIfNotExists(doctorRepository, docUser5, "Orthopedic", "MBBS, MS", 15, "DOC77889", 1500.0, "Orthopedics"));

            User docUser6 = seedUserIfNotExists(userRepository, passwordEncoder, "Dr Lisa Wong", "lisa@gmail.com", "8888888885", "doctor123", Role.DOCTOR);
            allDoctors.add(createDoctorProfileIfNotExists(doctorRepository, docUser6, "Psychiatrist", "MD", 7, "DOC99000", 900.0, "Psychiatry"));

            // PATIENT
            User patientUser1 = seedUserIfNotExists(userRepository, passwordEncoder, "Rahul Kumar", "patient@gmail.com", "9876543210", "patient123", Role.PATIENT);
            Patient pat1 = patientRepository.findByUserId(patientUser1.getId()).orElseGet(() -> {
                Patient p = new Patient();
                p.setUser(patientUser1);
                p.setBloodGroup("O+");
                p.setAllergies("Dust");
                p.setChronicConditions("Asthma");
                p.setEmergencyContactName("Ramesh Kumar");
                p.setEmergencyContactPhone("9999999999");
                p.setInsuranceProvider("Demo Insurance");
                p.setInsuranceNumber("INS123");
                return patientRepository.save(p);
            });

            // Seed Schedules for ALL doctors
            if (doctorScheduleRepository.count() == 0) {
                String[] days = {"MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"};
                for (Doctor d : allDoctors) {
                    for (String day : days) {
                        DoctorSchedule ds = new DoctorSchedule();
                        ds.setDoctor(d);
                        ds.setDayOfWeek(day);
                        ds.setStartTime(LocalTime.of(9, 0));
                        ds.setEndTime(LocalTime.of(17, 0));
                        ds.setSlotDurationMinutes(30);
                        ds.setAvailable(true);
                        doctorScheduleRepository.save(ds);
                    }
                }
            }

            // Seed Appointments & Related Data
            if (appointmentRepository.count() == 0) {
                // Past Appointments (6 records)
                for (int i = 1; i <= 6; i++) {
                    Doctor curDoc = allDoctors.get(i % allDoctors.size());
                    Appointment appt = new Appointment();
                    appt.setPatient(pat1);
                    appt.setDoctor(curDoc);
                    appt.setAppointmentDateTime(LocalDateTime.now().minusDays(i + 2).withHour(10).withMinute(0));
                    appt.setStatus(AppointmentStatus.COMPLETED);
                    appt.setSymptoms("Symptom description " + i);
                    appt.setNotes("Treatment notes for appointment " + i);
                    appt = appointmentRepository.save(appt);

                    // PAID Billing
                    Billing bill = new Billing();
                    bill.setAppointment(appt);
                    bill.setPatient(pat1);
                    bill.setDoctor(curDoc);
                    bill.setAmount(curDoc.getConsultationFee());
                    bill.setStatus(PaymentStatus.PAID);
                    bill.setPaymentMode(PaymentMode.CASH);
                    bill.setPaidAt(LocalDateTime.now().minusDays(i + 2));
                    billingRepository.save(bill);

                    // Prescription (for 5 of them)
                    if (i <= 5) {
                        Prescription pres = new Prescription();
                        pres.setAppointment(appt);
                        pres.setPatient(pat1);
                        pres.setDoctor(curDoc);
                        pres.setDiagnosis("Diagnosis for appointment " + i);
                        pres.setNotes("Take rest and medicines.");
                        
                        PrescriptionItem item = new PrescriptionItem();
                        item.setMedicineName("Medicine " + i);
                        item.setDosage("500mg");
                        item.setFrequency("Twice daily");
                        item.setDuration("7 days");
                        item.setInstructions("After food");
                        pres.addItem(item);
                        
                        prescriptionRepository.save(pres);
                    }

                    // Lab Test (for 2 of them)
                    if (i <= 2) {
                        LabTest lt = new LabTest();
                        lt.setAppointment(appt);
                        lt.setPatient(pat1);
                        lt.setDoctor(curDoc);
                        lt.setTestName("Lab Test " + i);
                        lt.setStatus(LabTestStatus.COMPLETED);
                        lt.setResultText("All results are within normal range.");
                        lt.setReportFilePath(dummyLabReport);
                        labTestRepository.save(lt);
                    }
                }

                // Final upcoming appointment
                Appointment upcoming = new Appointment();
                upcoming.setPatient(pat1);
                upcoming.setDoctor(allDoctors.get(0));
                upcoming.setAppointmentDateTime(LocalDateTime.now().plusDays(5).withHour(11).withMinute(0));
                upcoming.setStatus(AppointmentStatus.BOOKED);
                upcoming.setSymptoms("Follow up checkup");
                appointmentRepository.save(upcoming);

                // One Medical Record for patient
                MedicalRecord mr = new MedicalRecord();
                mr.setPatient(pat1);
                mr.setTitle("Old Vaccination Record");
                mr.setRecordType(MedicalRecordType.VACCINATION);
                mr.setDescription("Childhood vaccination certificates.");
                mr.setFilePath(dummyMedicalRecord);
                medicalRecordRepository.save(mr);

                // Notifications
                seedNotification(notificationRepository, patientUser1, NotificationType.APPOINTMENT, "New Appointment", "You have a new appointment scheduled.");
                seedNotification(notificationRepository, patientUser1, NotificationType.BILLING, "Bill Paid", "Your bill has been marked as PAID.");

                // Add 5 UNPAID bills as requested
                for (int i = 1; i <= 5; i++) {
                    Doctor billDoc = allDoctors.get(i % allDoctors.size());
                    Appointment billAppt = new Appointment();
                    billAppt.setPatient(pat1);
                    billAppt.setDoctor(billDoc);
                    billAppt.setAppointmentDateTime(LocalDateTime.now().minusDays(i + 10).withHour(9).withMinute(30));
                    billAppt.setStatus(AppointmentStatus.COMPLETED);
                    billAppt.setSymptoms("Follow up for bill " + i);
                    billAppt = appointmentRepository.save(billAppt);

                    Billing unpaidBill = new Billing();
                    unpaidBill.setAppointment(billAppt);
                    unpaidBill.setPatient(pat1);
                    unpaidBill.setDoctor(billDoc);
                    unpaidBill.setAmount(1500.0 + (i * 100)); // Varied charges
                    unpaidBill.setStatus(PaymentStatus.PENDING);
                    billingRepository.save(unpaidBill);
                }
            }

            System.out.println("Seeder completed: full initial data set seeded.");
        };
    }

    private String initDummyFile(String folderPath, String fileName) {
        try {
            // Use "uploads" as the base directory for physical file creation
            Path folder = Paths.get("uploads").resolve(folderPath);
            if (!Files.exists(folder)) {
                Files.createDirectories(folder);
            }
            Path file = folder.resolve(fileName);
            if (!Files.exists(file)) {
                Files.writeString(file, "This is a dummy medical file generated for testing purposes.");
            }
            return folderPath + "/" + fileName; // return relative path for DB
        } catch (IOException e) {
            System.err.println("Failed to create dummy file " + fileName + ": " + e.getMessage());
            return null;
        }
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

    private Doctor createDoctorProfileIfNotExists(DoctorRepository doctorRepository, User doctorUser, String spec, String qual, int exp, String license, Double fee, String dept) {
        return doctorRepository.findByUserId(doctorUser.getId()).orElseGet(() -> {
            Doctor d = new Doctor();
            d.setUser(doctorUser);
            d.setSpecialization(spec);
            d.setQualification(qual);
            d.setExperienceYears(exp);
            d.setLicenseNumber(license);
            d.setConsultationFee(fee);
            d.setHospitalName("City Hospital");
            d.setDepartment(dept);
            d.setApproved(true); 
            return doctorRepository.save(d);
        });
    }

    private void seedNotification(NotificationRepository notificationRepository, User user, NotificationType type, String title, String msg) {
        Notification n = new Notification();
        n.setUser(user);
        n.setType(type);
        n.setTitle(title);
        n.setMessage(msg);
        n.setIsRead(false);
        notificationRepository.save(n);
    }
}
