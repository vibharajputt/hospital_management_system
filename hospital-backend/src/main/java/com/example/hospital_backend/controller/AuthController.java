package com.example.hospital_backend.controller;

import com.example.hospital_backend.dto.request.LoginRequest;
import com.example.hospital_backend.dto.request.RegisterRequest;
import com.example.hospital_backend.dto.response.AuthResponse;
import com.example.hospital_backend.entity.User;
import com.example.hospital_backend.repository.UserRepository;
import com.example.hospital_backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    public AuthController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return new ResponseEntity<>(authService.register(request), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                Map<String, Object> err = new HashMap<>();
                err.put("success", false);
                err.put("message", "Not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(err);
            }

            String email = authentication.getName();
            User u = userRepository.findByEmail(email).orElse(null);

            if (u == null) {
                Map<String, Object> err = new HashMap<>();
                err.put("success", false);
                err.put("message", "User not found for email: " + email);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
            }

            Map<String, Object> data = new HashMap<>();
            data.put("id", u.getId());
            data.put("fullName", u.getFullName());
            data.put("email", u.getEmail());
            data.put("phone", u.getPhone());
            data.put("role", u.getRole() != null ? u.getRole().name() : "PATIENT");

            return ResponseEntity.ok(data);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", "Server error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        }
    }
}
