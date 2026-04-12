package com.example.hospital_backend.service.impl;

import com.example.hospital_backend.dto.request.DoctorScheduleRequest;
import com.example.hospital_backend.dto.response.DoctorScheduleResponse;
import com.example.hospital_backend.entity.Appointment;
import com.example.hospital_backend.entity.Doctor;
import com.example.hospital_backend.entity.DoctorSchedule;
import com.example.hospital_backend.enums.AppointmentStatus;
import com.example.hospital_backend.exception.ForbiddenException;
import com.example.hospital_backend.exception.ResourceNotFoundException;
import com.example.hospital_backend.repository.AppointmentRepository;
import com.example.hospital_backend.repository.DoctorRepository;
import com.example.hospital_backend.repository.DoctorScheduleRepository;
import com.example.hospital_backend.service.DoctorScheduleService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DoctorScheduleServiceImpl implements DoctorScheduleService {

    private final DoctorScheduleRepository scheduleRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;

    public DoctorScheduleServiceImpl(DoctorScheduleRepository scheduleRepository,
            DoctorRepository doctorRepository,
            AppointmentRepository appointmentRepository) {
        this.scheduleRepository = scheduleRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
    }

    @Override
    public DoctorScheduleResponse create(DoctorScheduleRequest request) {
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        if (!Boolean.TRUE.equals(doctor.getApproved())) {
            throw new ForbiddenException("Doctor is not approved by admin");
        }

        DoctorSchedule s = new DoctorSchedule();
        s.setDoctor(doctor);
        s.setDayOfWeek(request.getDayOfWeek().toUpperCase());
        s.setStartTime(LocalTime.parse(request.getStartTime()));
        s.setEndTime(LocalTime.parse(request.getEndTime()));
        s.setSlotDurationMinutes(request.getSlotDurationMinutes());
        s.setAvailable(request.getAvailable() != null ? request.getAvailable() : true);

        return map(scheduleRepository.save(s));
    }

    @Override
    public List<DoctorScheduleResponse> getDoctorSchedules(Long doctorId) {
        return scheduleRepository.findByDoctorId(doctorId).stream().map(this::map).collect(Collectors.toList());
    }

    @Override
    public List<String> getAvailableSlots(Long doctorId, String date) {
        LocalDate localDate = LocalDate.parse(date);
        String dayOfWeek = localDate.getDayOfWeek().name();

        List<DoctorSchedule> schedules = scheduleRepository.findByDoctorIdAndDayOfWeekAndAvailableTrue(doctorId,
                dayOfWeek);

        List<String> allSlots = new ArrayList<>();
        for (DoctorSchedule schedule : schedules) {
            LocalTime current = schedule.getStartTime();
            while (current.plusMinutes(schedule.getSlotDurationMinutes()).compareTo(schedule.getEndTime()) <= 0) {
                allSlots.add(current.toString());
                current = current.plusMinutes(schedule.getSlotDurationMinutes());
            }
        }

        LocalDateTime startOfDay = localDate.atStartOfDay();
        LocalDateTime endOfDay = localDate.atTime(23, 59, 59);

        List<Appointment> booked = appointmentRepository.findByDoctorIdAndAppointmentDateTimeBetweenAndStatusIn(
                doctorId,
                startOfDay,
                endOfDay,
                Arrays.asList(AppointmentStatus.BOOKED, AppointmentStatus.CONFIRMED));

        Set<String> bookedTimes = booked.stream()
                .map(a -> a.getAppointmentDateTime().toLocalTime().toString())
                .collect(Collectors.toSet());

        return allSlots.stream()
                .filter(slot -> !bookedTimes.contains(slot))
                .collect(Collectors.toList());
    }

    private DoctorScheduleResponse map(DoctorSchedule s) {
        DoctorScheduleResponse r = new DoctorScheduleResponse();
        r.setId(s.getId());
        r.setDoctorId(s.getDoctor().getId());
        r.setDayOfWeek(s.getDayOfWeek());
        r.setStartTime(s.getStartTime().toString());
        r.setEndTime(s.getEndTime().toString());
        r.setSlotDurationMinutes(s.getSlotDurationMinutes());
        r.setAvailable(s.getAvailable());
        return r;
    }
}