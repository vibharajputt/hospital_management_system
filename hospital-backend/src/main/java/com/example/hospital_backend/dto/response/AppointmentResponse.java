package com.example.hospital_backend.dto.response;

public class AppointmentResponse {

    private Long id;

    private Long patientId;
    private String patientName;

    private Long doctorId;
    private String doctorName;
    private String specialization;

    // ISO string: 2026-04-13T10:30:00
    private String appointmentDateTime;

    private String status; // BOOKED/CONFIRMED/COMPLETED/CANCELLED

    private String symptoms;
    private String notes;

    public AppointmentResponse() {
    }

    public Long getId() {
        return id;
    }

    public Long getPatientId() {
        return patientId;
    }

    public String getPatientName() {
        return patientName;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public String getSpecialization() {
        return specialization;
    }

    public String getAppointmentDateTime() {
        return appointmentDateTime;
    }

    public String getStatus() {
        return status;
    }

    public String getSymptoms() {
        return symptoms;
    }

    public String getNotes() {
        return notes;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public void setAppointmentDateTime(String appointmentDateTime) {
        this.appointmentDateTime = appointmentDateTime;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setSymptoms(String symptoms) {
        this.symptoms = symptoms;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}