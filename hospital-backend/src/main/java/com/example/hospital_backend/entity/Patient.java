package com.example.hospital_backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "patients")
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(length = 10)
    private String bloodGroup;

    private String allergies;

    private String chronicConditions;

    private String emergencyContactName;

    private String emergencyContactPhone;

    private String insuranceProvider;

    private String insuranceNumber;

    public Patient() {
    }

    public Patient(Long id, User user, String bloodGroup, String allergies, String chronicConditions,
            String emergencyContactName, String emergencyContactPhone,
            String insuranceProvider, String insuranceNumber) {
        this.id = id;
        this.user = user;
        this.bloodGroup = bloodGroup;
        this.allergies = allergies;
        this.chronicConditions = chronicConditions;
        this.emergencyContactName = emergencyContactName;
        this.emergencyContactPhone = emergencyContactPhone;
        this.insuranceProvider = insuranceProvider;
        this.insuranceNumber = insuranceNumber;
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public String getBloodGroup() {
        return bloodGroup;
    }

    public String getAllergies() {
        return allergies;
    }

    public String getChronicConditions() {
        return chronicConditions;
    }

    public String getEmergencyContactName() {
        return emergencyContactName;
    }

    public String getEmergencyContactPhone() {
        return emergencyContactPhone;
    }

    public String getInsuranceProvider() {
        return insuranceProvider;
    }

    public String getInsuranceNumber() {
        return insuranceNumber;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setBloodGroup(String bloodGroup) {
        this.bloodGroup = bloodGroup;
    }

    public void setAllergies(String allergies) {
        this.allergies = allergies;
    }

    public void setChronicConditions(String chronicConditions) {
        this.chronicConditions = chronicConditions;
    }

    public void setEmergencyContactName(String emergencyContactName) {
        this.emergencyContactName = emergencyContactName;
    }

    public void setEmergencyContactPhone(String emergencyContactPhone) {
        this.emergencyContactPhone = emergencyContactPhone;
    }

    public void setInsuranceProvider(String insuranceProvider) {
        this.insuranceProvider = insuranceProvider;
    }

    public void setInsuranceNumber(String insuranceNumber) {
        this.insuranceNumber = insuranceNumber;
    }
}