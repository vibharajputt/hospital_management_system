package com.example.hospital_backend.controller;

import com.example.hospital_backend.dto.response.AdminDashboardResponse;
import com.example.hospital_backend.dto.response.DoctorDashboardResponse;
import com.example.hospital_backend.dto.response.PatientDashboardResponse;
import com.example.hospital_backend.entity.Doctor;
import com.example.hospital_backend.entity.Patient;
import com.example.hospital_backend.entity.User;
import com.example.hospital_backend.enums.AppointmentStatus;
import com.example.hospital_backend.enums.LabTestStatus;
import com.example.hospital_backend.enums.PaymentStatus;
import com.example.hospital_backend.exception.ResourceNotFoundException;
import com.example.hospital_backend.repository.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;

@RestController
@RequestMapping("/api/v1/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    private final AppointmentRepository appointmentRepository;
    private final BillingRepository billingRepository;
    private final NotificationRepository notificationRepository;
    private final LabTestRepository labTestRepository;
    private final PrescriptionRepository prescriptionRepository;

    public DashboardController(UserRepository userRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            AppointmentRepository appointmentRepository,
            BillingRepository billingRepository,
            NotificationRepository notificationRepository,
            LabTestRepository labTestRepository,
            PrescriptionRepository prescriptionRepository) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.billingRepository = billingRepository;
        this.notificationRepository = notificationRepository;
        this.labTestRepository = labTestRepository;
        this.prescriptionRepository = prescriptionRepository;
    }

    @PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
    @GetMapping("/patient")
    public PatientDashboardResponse patient(Authentication auth) {
        User u = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Auto-create patient profile if missing
        Patient p = patientRepository.findByUserId(u.getId()).orElseGet(() -> {
            Patient newP = new Patient();
            newP.setUser(u);
            return patientRepository.save(newP);
        });

        PatientDashboardResponse r = new PatientDashboardResponse();
        r.setPatientId(p.getId());
        r.setPatientName(p.getUser().getFullName());

        r.setTotalAppointments(appointmentRepository.countByPatientId(p.getId()));
        r.setUpcomingAppointments(
                appointmentRepository.countByPatientIdAndStatusInAndAppointmentDateTimeAfter(
                        p.getId(),
                        Arrays.asList(AppointmentStatus.BOOKED, AppointmentStatus.CONFIRMED),
                        LocalDateTime.now()));

        r.setTotalBills(billingRepository.countByPatientId(p.getId()));
        r.setUnpaidBills(billingRepository.countByPatientIdAndStatus(p.getId(), PaymentStatus.PENDING));

        r.setUnreadNotifications(notificationRepository.countByUserIdAndIsReadFalse(u.getId()));

        r.setPendingLabTests(
                labTestRepository.countByPatientIdAndStatusIn(
                        p.getId(),
                        Arrays.asList(LabTestStatus.ORDERED, LabTestStatus.IN_PROGRESS)));

        r.setTotalPrescriptions(prescriptionRepository.countByPatientId(p.getId()));

        return r;
    }

    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    @GetMapping("/doctor")
    public DoctorDashboardResponse doctor(Authentication auth) {
        User u = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Doctor d = doctorRepository.findByUserId(u.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));

        LocalDate today = LocalDate.now();
        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end = today.atTime(23, 59, 59);

        DoctorDashboardResponse r = new DoctorDashboardResponse();
        r.setDoctorId(d.getId());
        r.setDoctorName(d.getUser().getFullName());
        r.setApproved(d.getApproved());

        r.setTodaysAppointments(
                appointmentRepository.countByDoctorIdAndStatusInAndAppointmentDateTimeBetween(
                        d.getId(),
                        Arrays.asList(AppointmentStatus.BOOKED, AppointmentStatus.CONFIRMED),
                        start,
                        end));

        r.setUpcomingAppointments(
                appointmentRepository.countByDoctorIdAndStatusInAndAppointmentDateTimeAfter(
                        d.getId(),
                        Arrays.asList(AppointmentStatus.BOOKED, AppointmentStatus.CONFIRMED),
                        LocalDateTime.now()));

        r.setUnreadNotifications(notificationRepository.countByUserIdAndIsReadFalse(u.getId()));

        r.setPendingLabTests(
                labTestRepository.countByDoctorIdAndStatusIn(
                        d.getId(),
                        Arrays.asList(LabTestStatus.ORDERED, LabTestStatus.IN_PROGRESS)));

        r.setTotalPrescriptionsWritten(prescriptionRepository.countByDoctorId(d.getId()));

        return r;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin")
    public AdminDashboardResponse admin() {
        AdminDashboardResponse r = new AdminDashboardResponse();

        r.setTotalUsers(userRepository.count());
        r.setDoctorsPendingApproval(doctorRepository.countByApprovedFalse());
        r.setTotalDoctors(doctorRepository.count());
        r.setTotalPatients(patientRepository.count());

        Double revenue = billingRepository.sumAmountByStatus(PaymentStatus.PAID);
        r.setTotalRevenuePaid(revenue != null ? revenue : 0.0);

        return r;
    }
}