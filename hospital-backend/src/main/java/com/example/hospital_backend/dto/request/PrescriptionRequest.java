package com.example.hospital_backend.dto.request;

import jakarta.validation.constraints.NotNull;

import java.util.List;

public class PrescriptionRequest {

    @NotNull(message = "appointmentId is required")
    private Long appointmentId;

    private String diagnosis;
    private String notes;

    private List<PrescriptionItemRequest> items;

    public PrescriptionRequest() {
    }

    public Long getAppointmentId() {
        return appointmentId;
    }

    public String getDiagnosis() {
        return diagnosis;
    }

    public String getNotes() {
        return notes;
    }

    public List<PrescriptionItemRequest> getItems() {
        return items;
    }

    public void setAppointmentId(Long appointmentId) {
        this.appointmentId = appointmentId;
    }

    public void setDiagnosis(String diagnosis) {
        this.diagnosis = diagnosis;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public void setItems(List<PrescriptionItemRequest> items) {
        this.items = items;
    }
}