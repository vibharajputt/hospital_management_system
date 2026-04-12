package com.example.hospital_backend.controller;

import com.example.hospital_backend.service.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/test")
@CrossOrigin(origins = "*")
public class EmailTestController {

    private final EmailService emailService;

    public EmailTestController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping("/send-email")
    public ResponseEntity<?> sendEmail(@RequestParam String to) {
        emailService.sendEmail(to, "Test Email - Hospital System", "Email setup working successfully.");
        return ResponseEntity.ok("Email sent to: " + to);
    }
}