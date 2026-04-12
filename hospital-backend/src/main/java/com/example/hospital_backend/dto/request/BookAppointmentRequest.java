package com.example.hospital_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class BookAppointmentRequest {

    @NotNull(message = "doctorId is required")
    private Long doctorId;

    @NotBlank(message = "appointmentDateTime is required")
    private String appointmentDateTime; // ISO: 2026-04-13T10:30:00

    private String symptoms;
    private String notes;

    public BookAppointmentRequest() {
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public String getAppointmentDateTime() {
        return appointmentDateTime;
    }

    public String getSymptoms() {
        return symptoms;
    }

    public String getNotes() {
        return notes;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public void setAppointmentDateTime(String appointmentDateTime) {
        this.appointmentDateTime = appointmentDateTime;
    }

    public void setSymptoms(String symptoms) {
        this.symptoms = symptoms;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}