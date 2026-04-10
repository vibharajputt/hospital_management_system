package com.example.hospital_backend.dto.request;

import jakarta.validation.constraints.NotBlank;

public class AppointmentStatusUpdateRequest {

    @NotBlank(message = "status is required")
    private String status; // BOOKED/CONFIRMED/COMPLETED/CANCELLED

    public AppointmentStatusUpdateRequest() {
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}