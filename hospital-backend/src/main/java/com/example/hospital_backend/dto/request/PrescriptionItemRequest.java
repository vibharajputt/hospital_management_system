package com.example.hospital_backend.dto.request;

import jakarta.validation.constraints.NotBlank;

public class PrescriptionItemRequest {

    @NotBlank(message = "medicineName is required")
    private String medicineName;

    private String dosage;
    private String frequency;
    private String duration;
    private String instructions;

    public PrescriptionItemRequest() {
    }

    public String getMedicineName() {
        return medicineName;
    }

    public String getDosage() {
        return dosage;
    }

    public String getFrequency() {
        return frequency;
    }

    public String getDuration() {
        return duration;
    }

    public String getInstructions() {
        return instructions;
    }

    public void setMedicineName(String medicineName) {
        this.medicineName = medicineName;
    }

    public void setDosage(String dosage) {
        this.dosage = dosage;
    }

    public void setFrequency(String frequency) {
        this.frequency = frequency;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }
}