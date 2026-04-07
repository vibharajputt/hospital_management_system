package com.example.hospital_backend.controller;

import com.example.hospital_backend.dto.request.DoctorScheduleRequest;
import com.example.hospital_backend.entity.Doctor;
import com.example.hospital_backend.entity.DoctorSchedule;
import com.example.hospital_backend.repository.DoctorRepository;
import com.example.hospital_backend.repository.DoctorScheduleRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/v1/doctor-schedules")
@CrossOrigin(origins = "*")
public class DoctorScheduleController {

    private final DoctorScheduleRepository doctorScheduleRepository;
    private final DoctorRepository doctorRepository;

    public DoctorScheduleController(DoctorScheduleRepository doctorScheduleRepository,
            DoctorRepository doctorRepository) {
        this.doctorScheduleRepository = doctorScheduleRepository;
        this.doctorRepository = doctorRepository;
    }

    @PostMapping
    public ResponseEntity<?> createSchedule(@RequestBody DoctorScheduleRequest request) {
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        DoctorSchedule schedule = new DoctorSchedule();
        schedule.setDoctor(doctor);
        schedule.setDayOfWeek(request.getDayOfWeek().toUpperCase());
        schedule.setStartTime(LocalTime.parse(request.getStartTime()));
        schedule.setEndTime(LocalTime.parse(request.getEndTime()));
        schedule.setSlotDurationMinutes(request.getSlotDurationMinutes());
        schedule.setAvailable(request.getAvailable() != null ? request.getAvailable() : true);

        return ResponseEntity.ok(doctorScheduleRepository.save(schedule));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<?> getDoctorSchedules(@PathVariable Long doctorId) {
        return ResponseEntity.ok(doctorScheduleRepository.findByDoctorId(doctorId));
    }

    @GetMapping("/doctor/{doctorId}/slots")
    public ResponseEntity<?> getAvailableSlots(@PathVariable Long doctorId,
            @RequestParam String date) {
        LocalDate localDate = LocalDate.parse(date);
        String dayOfWeek = localDate.getDayOfWeek().name();

        List<DoctorSchedule> schedules = doctorScheduleRepository.findByDoctorIdAndDayOfWeekAndAvailableTrue(doctorId,
                dayOfWeek);

        List<String> slots = new ArrayList<>();

        for (DoctorSchedule schedule : schedules) {
            LocalTime current = schedule.getStartTime();
            while (current.plusMinutes(schedule.getSlotDurationMinutes()).compareTo(schedule.getEndTime()) <= 0) {
                slots.add(current.toString());
                current = current.plusMinutes(schedule.getSlotDurationMinutes());
            }
        }

        return ResponseEntity.ok(slots);
    }
}