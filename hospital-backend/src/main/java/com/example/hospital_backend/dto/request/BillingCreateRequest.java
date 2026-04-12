package com.example.hospital_backend.dto.request;

import jakarta.validation.constraints.NotNull;

public class BillingCreateRequest {

    @NotNull(message = "appointmentId is required")
    private Long appointmentId;

    // if null, we will take doctor's consultationFee
    private Double amount;

    public BillingCreateRequest() {
    }

    public Long getAppointmentId() {
        return appointmentId;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAppointmentId(Long appointmentId) {
        this.appointmentId = appointmentId;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }
}