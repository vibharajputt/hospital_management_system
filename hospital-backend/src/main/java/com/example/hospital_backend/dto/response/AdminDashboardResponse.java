package com.example.hospital_backend.dto.response;

public class AdminDashboardResponse {
    private long totalUsers;
    private long doctorsPendingApproval;
    private long totalDoctors;
    private long totalPatients;

    private double totalRevenuePaid;

    public AdminDashboardResponse() {
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public long getDoctorsPendingApproval() {
        return doctorsPendingApproval;
    }

    public long getTotalDoctors() {
        return totalDoctors;
    }

    public long getTotalPatients() {
        return totalPatients;
    }

    public double getTotalRevenuePaid() {
        return totalRevenuePaid;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public void setDoctorsPendingApproval(long doctorsPendingApproval) {
        this.doctorsPendingApproval = doctorsPendingApproval;
    }

    public void setTotalDoctors(long totalDoctors) {
        this.totalDoctors = totalDoctors;
    }

    public void setTotalPatients(long totalPatients) {
        this.totalPatients = totalPatients;
    }

    public void setTotalRevenuePaid(double totalRevenuePaid) {
        this.totalRevenuePaid = totalRevenuePaid;
    }
}