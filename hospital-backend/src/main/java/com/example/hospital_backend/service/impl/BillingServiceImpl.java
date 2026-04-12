package com.example.hospital_backend.service.impl;

import com.example.hospital_backend.dto.request.BillingCreateRequest;
import com.example.hospital_backend.dto.request.BillingPayRequest;
import com.example.hospital_backend.dto.response.BillingResponse;
import com.example.hospital_backend.entity.*;
import com.example.hospital_backend.enums.PaymentMode;
import com.example.hospital_backend.enums.PaymentStatus;
import com.example.hospital_backend.exception.ConflictException;
import com.example.hospital_backend.exception.ForbiddenException;
import com.example.hospital_backend.exception.ResourceNotFoundException;
import com.example.hospital_backend.repository.*;
import com.example.hospital_backend.service.BillingService;
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

    public BillingServiceImpl(BillingRepository billingRepository,
            AppointmentRepository appointmentRepository,
            UserRepository userRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository) {
        this.billingRepository = billingRepository;
        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
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
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));
    }

    private Doctor currentDoctor() {
        User u = currentUser();
        return doctorRepository.findByUserId(u.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));
    }

    @Override
    @Transactional
    public BillingResponse createBill(BillingCreateRequest request) {
        // Only ADMIN/STAFF should call this (controller will secure)
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

        return map(billingRepository.save(b));
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

        // Only patient owner can pay
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

        return map(billingRepository.save(b));
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