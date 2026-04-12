package com.example.hospital_backend.dto.response;

public class PatientDashboardResponse {
    private Long patientId;
    private String patientName;

    private long totalAppointments;
    private long upcomingAppointments;

    private long totalBills;
    private long unpaidBills;

    private long unreadNotifications;

    private long pendingLabTests;
    private long totalPrescriptions;

    public PatientDashboardResponse() {
    }

    public Long getPatientId() {
        return patientId;
    }

    public String getPatientName() {
        return patientName;
    }

    public long getTotalAppointments() {
        return totalAppointments;
    }

    public long getUpcomingAppointments() {
        return upcomingAppointments;
    }

    public long getTotalBills() {
        return totalBills;
    }

    public long getUnpaidBills() {
        return unpaidBills;
    }

    public long getUnreadNotifications() {
        return unreadNotifications;
    }

    public long getPendingLabTests() {
        return pendingLabTests;
    }

    public long getTotalPrescriptions() {
        return totalPrescriptions;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public void setTotalAppointments(long totalAppointments) {
        this.totalAppointments = totalAppointments;
    }

    public void setUpcomingAppointments(long upcomingAppointments) {
        this.upcomingAppointments = upcomingAppointments;
    }

    public void setTotalBills(long totalBills) {
        this.totalBills = totalBills;
    }

    public void setUnpaidBills(long unpaidBills) {
        this.unpaidBills = unpaidBills;
    }

    public void setUnreadNotifications(long unreadNotifications) {
        this.unreadNotifications = unreadNotifications;
    }

    public void setPendingLabTests(long pendingLabTests) {
        this.pendingLabTests = pendingLabTests;
    }

    public void setTotalPrescriptions(long totalPrescriptions) {
        this.totalPrescriptions = totalPrescriptions;
    }
}