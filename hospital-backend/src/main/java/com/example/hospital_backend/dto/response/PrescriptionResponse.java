package com.example.hospital_backend.dto.response;

import java.util.List;

public class PrescriptionResponse {

    private Long id;
    private Long appointmentId;

    private Long patientId;
    private String patientName;

    private Long doctorId;
    private String doctorName;

    private String diagnosis;
    private String notes;
    private String createdAt;

    private List<PrescriptionItemResponse> items;

    public PrescriptionResponse() {
    }

    public Long getId() {
        return id;
    }

    public Long getAppointmentId() {
        return appointmentId;
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

    public String getDiagnosis() {
        return diagnosis;
    }

    public String getNotes() {
        return notes;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public List<PrescriptionItemResponse> getItems() {
        return items;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setAppointmentId(Long appointmentId) {
        this.appointmentId = appointmentId;
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

    public void setDiagnosis(String diagnosis) {
        this.diagnosis = diagnosis;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public void setItems(List<PrescriptionItemResponse> items) {
        this.items = items;
    }
}