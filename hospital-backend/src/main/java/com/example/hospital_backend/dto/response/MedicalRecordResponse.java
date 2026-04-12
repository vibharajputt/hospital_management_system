package com.example.hospital_backend.dto.response;

public class MedicalRecordResponse {

    private Long id;
    private Long patientId;
    private Long doctorId; // nullable
    private String recordType;
    private String title;
    private String description;
    private String createdAt;

    private String downloadUrl;

    public MedicalRecordResponse() {
    }

    public Long getId() {
        return id;
    }

    public Long getPatientId() {
        return patientId;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public String getRecordType() {
        return recordType;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public String getDownloadUrl() {
        return downloadUrl;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public void setRecordType(String recordType) {
        this.recordType = recordType;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public void setDownloadUrl(String downloadUrl) {
        this.downloadUrl = downloadUrl;
    }
}