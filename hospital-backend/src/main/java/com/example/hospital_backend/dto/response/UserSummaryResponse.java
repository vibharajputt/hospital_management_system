package com.example.hospital_backend.dto.response;

public class UserSummaryResponse {

    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String role;

    public UserSummaryResponse() {
    }

    public UserSummaryResponse(Long id, String fullName, String email, String phone, String role) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.role = role;
    }

    public Long getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public String getRole() {
        return role;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public void setRole(String role) {
        this.role = role;
    }<<<<<<<HEAD
}=======}>>>>>>>c0dac223ccdeae0dd8781e2b7cc8c99a648085d5
