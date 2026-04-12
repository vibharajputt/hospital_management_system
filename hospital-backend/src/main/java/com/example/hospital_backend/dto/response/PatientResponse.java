package com.example.hospital_backend.dto.response;

public class PatientResponse {
    private Long id;
    private UserSummaryResponse user;

    private String bloodGroup;
    private String allergies;
    private String chronicConditions;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String insuranceProvider;
    private String insuranceNumber;

    public PatientResponse() {
    }

    public Long getId() {
        return id;
    }

    public UserSummaryResponse getUser() {
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

    public void setUser(UserSummaryResponse user) {
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