package com.example.hospital_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class LabTestOrderRequest {

    @NotNull(message = "appointmentId is required")
    private Long appointmentId;

    @NotBlank(message = "testName is required")
    private String testName;

    private String instructions;

    public LabTestOrderRequest() {
    }

    public Long getAppointmentId() {
        return appointmentId;
    }

    public String getTestName() {
        return testName;
    }

    public String getInstructions() {
        return instructions;
    }

    public void setAppointmentId(Long appointmentId) {
        this.appointmentId = appointmentId;
    }

    public void setTestName(String testName) {
        this.testName = testName;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }
}