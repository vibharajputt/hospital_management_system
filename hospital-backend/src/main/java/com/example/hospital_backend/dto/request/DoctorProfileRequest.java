package com.example.hospital_backend.dto.request;

public class DoctorProfileRequest {

    private Long userId;
    private String specialization;
    private String qualification;
    private Integer experienceYears;
    private String licenseNumber;
    private Double consultationFee;
    private String hospitalName;
    private String department;

    public DoctorProfileRequest() {
    }

    public Long getUserId() {
        return userId;
    }

    public String getSpecialization() {
        return specialization;
    }

    public String getQualification() {
        return qualification;
    }

    public Integer getExperienceYears() {
        return experienceYears;
    }

    public String getLicenseNumber() {
        return licenseNumber;
    }

    public Double getConsultationFee() {
        return consultationFee;
    }

    public String getHospitalName() {
        return hospitalName;
    }

    public String getDepartment() {
        return department;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public void setQualification(String qualification) {
        this.qualification = qualification;
    }

    public void setExperienceYears(Integer experienceYears) {
        this.experienceYears = experienceYears;
    }

    public void setLicenseNumber(String licenseNumber) {
        this.licenseNumber = licenseNumber;
    }

    public void setConsultationFee(Double consultationFee) {
        this.consultationFee = consultationFee;
    }

    public void setHospitalName(String hospitalName) {
        this.hospitalName = hospitalName;
    }

    public void setDepartment(String department) {
        this.department = department;
    }
}