package com.example.hospital_backend.entity;

import com.example.hospital_backend.enums.LabTestStatus;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "lab_tests")
public class LabTest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Many tests can be ordered for one appointment
    @ManyToOne
    @JoinColumn(name = "appointment_id", nullable = false)
    private Appointment appointment;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(nullable = false)
    private String testName;

    @Column(length = 2000)
    private String instructions;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LabTestStatus status = LabTestStatus.ORDERED;

    @Column(length = 4000)
    private String resultText;

    // stored relative path like: lab-reports/uuid_file.pdf
    private String reportFilePath;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public LabTest() {
    }

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null)
            this.status = LabTestStatus.ORDERED;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Appointment getAppointment() {
        return appointment;
    }

    public Patient getPatient() {
        return patient;
    }

    public Doctor getDoctor() {
        return doctor;
    }

    public String getTestName() {
        return testName;
    }

    public String getInstructions() {
        return instructions;
    }

    public LabTestStatus getStatus() {
        return status;
    }

    public String getResultText() {
        return resultText;
    }

    public String getReportFilePath() {
        return reportFilePath;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setAppointment(Appointment appointment) {
        this.appointment = appointment;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }

    public void setDoctor(Doctor doctor) {
        this.doctor = doctor;
    }

    public void setTestName(String testName) {
        this.testName = testName;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }

    public void setStatus(LabTestStatus status) {
        this.status = status;
    }

    public void setResultText(String resultText) {
        this.resultText = resultText;
    }

    public void setReportFilePath(String reportFilePath) {
        this.reportFilePath = reportFilePath;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}