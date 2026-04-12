package com.example.hospital_backend.dto.response;

public class DoctorDashboardResponse {
    private Long doctorId;
    private String doctorName;
    private Boolean approved;

    private long todaysAppointments;
    private long upcomingAppointments;

    private long unreadNotifications;
    private long pendingLabTests;
    private long totalPrescriptionsWritten;

    public DoctorDashboardResponse() {
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public Boolean getApproved() {
        return approved;
    }

    public long getTodaysAppointments() {
        return todaysAppointments;
    }

    public long getUpcomingAppointments() {
        return upcomingAppointments;
    }

    public long getUnreadNotifications() {
        return unreadNotifications;
    }

    public long getPendingLabTests() {
        return pendingLabTests;
    }

    public long getTotalPrescriptionsWritten() {
        return totalPrescriptionsWritten;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
    }

    public void setApproved(Boolean approved) {
        this.approved = approved;
    }

    public void setTodaysAppointments(long todaysAppointments) {
        this.todaysAppointments = todaysAppointments;
    }

    public void setUpcomingAppointments(long upcomingAppointments) {
        this.upcomingAppointments = upcomingAppointments;
    }

    public void setUnreadNotifications(long unreadNotifications) {
        this.unreadNotifications = unreadNotifications;
    }

    public void setPendingLabTests(long pendingLabTests) {
        this.pendingLabTests = pendingLabTests;
    }

    public void setTotalPrescriptionsWritten(long totalPrescriptionsWritten) {
        this.totalPrescriptionsWritten = totalPrescriptionsWritten;
    }
}