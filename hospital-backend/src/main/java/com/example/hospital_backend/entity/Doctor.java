package com.example.hospital_backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "doctors")
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private String specialization;
    private String qualification;
    private Integer experienceYears;
    private String licenseNumber;
    private Double consultationFee;
    private String hospitalName;
    private String department;

    // Admin approval
    @Column(nullable = false)
    private Boolean approved = false;

    public Doctor() {
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
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

    public Boolean getApproved() {
        return approved;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setUser(User user) {
        this.user = user;
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

    public void setApproved(Boolean approved) {
        this.approved = approved;
    }
}