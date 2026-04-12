package com.example.hospital_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class DoctorScheduleRequest {

    @NotNull(message = "doctorId is required")
    private Long doctorId;

    @NotBlank(message = "dayOfWeek is required")
    private String dayOfWeek; // MONDAY...

    @NotBlank(message = "startTime is required")
    private String startTime; // 10:00

    @NotBlank(message = "endTime is required")
    private String endTime; // 13:00

    @NotNull(message = "slotDurationMinutes is required")
    private Integer slotDurationMinutes;

    private Boolean available;

    public DoctorScheduleRequest() {
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public String getDayOfWeek() {
        return dayOfWeek;
    }

    public String getStartTime() {
        return startTime;
    }

    public String getEndTime() {
        return endTime;
    }

    public Integer getSlotDurationMinutes() {
        return slotDurationMinutes;
    }

    public Boolean getAvailable() {
        return available;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public void setDayOfWeek(String dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }

    public void setSlotDurationMinutes(Integer slotDurationMinutes) {
        this.slotDurationMinutes = slotDurationMinutes;
    }

    public void setAvailable(Boolean available) {
        this.available = available;
    }
}