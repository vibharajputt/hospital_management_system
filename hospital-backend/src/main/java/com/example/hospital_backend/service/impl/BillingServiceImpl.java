package com.example.hospital_backend.service.impl;

import com.example.hospital_backend.dto.request.BillingCreateRequest;
import com.example.hospital_backend.dto.request.BillingPayRequest;
import com.example.hospital_backend.dto.response.BillingResponse;
import com.example.hospital_backend.entity.*;
import com.example.hospital_backend.enums.NotificationType;
import com.example.hospital_backend.enums.PaymentMode;
import com.example.hospital_backend.enums.PaymentStatus;
import com.example.hospital_backend.exception.ConflictException;
import com.example.hospital_backend.exception.ForbiddenException;
import com.example.hospital_backend.exception.ResourceNotFoundException;
import com.example.hospital_backend.repository.*;
import com.example.hospital_backend.service.BillingService;
import com.example.hospital_backend.service.EmailService;
import com.example.hospital_backend.service.NotificationService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BillingServiceImpl implements BillingService {

    private final BillingRepository billingRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    private final NotificationService notificationService;
    private final EmailService emailService;

    public BillingServiceImpl(BillingRepository billingRepository,
            AppointmentRepository appointmentRepository,
            UserRepository userRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            NotificationService notificationService,
            EmailService emailService) {
        this.billingRepository = billingRepository;
        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.notificationService = notificationService;
        this.emailService = emailService;
    }

    private String currentEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    private User currentUser() {
        return userRepository.findByEmail(currentEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Patient currentPatient() {
        User u = currentUser();
        return patientRepository.findByUserId(u.getId())
                .orElseGet(() -> {
                    Patient p = new Patient();
                    p.setUser(u);
                    return patientRepository.save(p);
                });
    }

    private Doctor currentDoctor() {
        User u = currentUser();
        return doctorRepository.findByUserId(u.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));
    }

    private void notifyAndEmail(Long userId, NotificationType type, String title, String message) {
        try {
            notificationService.create(userId, type, title, message);
        } catch (Exception ignored) {
        }
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user != null && user.getEmail() != null) {
                emailService.sendEmail(user.getEmail(), title, message);
            }
        } catch (Exception ignored) {
        }
    }

    @Override
    @Transactional
    public BillingResponse createBill(BillingCreateRequest request) {
        Appointment appt = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (billingRepository.findByAppointmentId(appt.getId()).isPresent()) {
            throw new ConflictException("Bill already exists for this appointment");
        }

        Double amount = request.getAmount();
        if (amount == null) {
            amount = appt.getDoctor().getConsultationFee() != null ? appt.getDoctor().getConsultationFee() : 0.0;
        }

        Billing b = new Billing();
        b.setAppointment(appt);
        b.setPatient(appt.getPatient());
        b.setDoctor(appt.getDoctor());
        b.setAmount(amount);
        b.setStatus(PaymentStatus.PENDING);

        Billing saved = billingRepository.save(b);

        // Notify patient
        notifyAndEmail(saved.getPatient().getUser().getId(), NotificationType.BILLING,
                "New Bill Generated",
                "A bill of amount ₹" + saved.getAmount() + " is generated. Invoice: " + saved.getInvoiceNumber());

        return map(saved);
    }

    @Override
    public List<BillingResponse> getMyBillsAsPatient() {
        Patient p = currentPatient();
        return billingRepository.findByPatientIdOrderByCreatedAtDesc(p.getId())
                .stream().map(this::map).collect(Collectors.toList());
    }

    @Override
    public List<BillingResponse> getMyBillsAsDoctor() {
        Doctor d = currentDoctor();
        return billingRepository.findByDoctorIdOrderByCreatedAtDesc(d.getId())
                .stream().map(this::map).collect(Collectors.toList());
    }

    @Override
    public BillingResponse getByIdForCurrentUser(Long billingId) {
        Billing b = billingRepository.findById(billingId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found"));

        authorize(b);
        return map(b);
    }

    @Override
    @Transactional
    public BillingResponse payMyBill(Long billingId, BillingPayRequest request) {
        Billing b = billingRepository.findById(billingId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found"));

        Patient me = currentPatient();
        if (!b.getPatient().getId().equals(me.getId())) {
            throw new ForbiddenException("You cannot pay someone else's bill");
        }

        if (b.getStatus() == PaymentStatus.PAID) {
            throw new ConflictException("Bill is already paid");
        }

        PaymentMode mode = PaymentMode.valueOf(request.getPaymentMode().toUpperCase());
        b.setPaymentMode(mode);
        b.setStatus(PaymentStatus.PAID);
        b.setPaidAt(LocalDateTime.now());

        Billing saved = billingRepository.save(b);

        // Notify patient + doctor
        notifyAndEmail(saved.getPatient().getUser().getId(), NotificationType.BILLING,
                "Payment Successful",
                "Your payment for invoice " + saved.getInvoiceNumber() + " is successful. Mode: " + mode.name());

        notifyAndEmail(saved.getDoctor().getUser().getId(), NotificationType.BILLING,
                "Bill Paid",
                "Bill paid by " + saved.getPatient().getUser().getFullName() + ". Invoice: "
                        + saved.getInvoiceNumber());

        return map(saved);
    }

    private void authorize(Billing b) {
        User u = currentUser();
        String role = u.getRole().name();

        if ("ADMIN".equals(role) || "STAFF".equals(role))
            return;

        if ("PATIENT".equals(role)) {
            Patient p = currentPatient();
            if (!b.getPatient().getId().equals(p.getId())) {
                throw new ForbiddenException("You cannot access another patient's bill");
            }
        }

        if ("DOCTOR".equals(role)) {
            Doctor d = currentDoctor();
            if (!b.getDoctor().getId().equals(d.getId())) {
                throw new ForbiddenException("You cannot access another doctor's bill");
            }
        }
    }

    private BillingResponse map(Billing b) {
        BillingResponse r = new BillingResponse();
        r.setId(b.getId());
        r.setInvoiceNumber(b.getInvoiceNumber());
        r.setAppointmentId(b.getAppointment().getId());

        r.setPatientId(b.getPatient().getId());
        r.setPatientName(b.getPatient().getUser().getFullName());

        r.setDoctorId(b.getDoctor().getId());
        r.setDoctorName(b.getDoctor().getUser().getFullName());

        r.setAmount(b.getAmount());
        r.setStatus(b.getStatus().name());
        r.setPaymentMode(b.getPaymentMode() != null ? b.getPaymentMode().name() : null);

        r.setPaidAt(b.getPaidAt() != null ? b.getPaidAt().toString() : null);
        r.setCreatedAt(b.getCreatedAt() != null ? b.getCreatedAt().toString() : null);
        return r;
    }
}