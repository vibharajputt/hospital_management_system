package com.example.hospital_backend.controller;

import com.example.hospital_backend.dto.request.LoginRequest;
import com.example.hospital_backend.dto.request.RegisterRequest;
import com.example.hospital_backend.dto.response.AuthResponse;
import com.example.hospital_backend.dto.response.UserSummaryResponse;
import com.example.hospital_backend.entity.User;
import com.example.hospital_backend.repository.UserRepository;
import com.example.hospital_backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "*")
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
    public ResponseEntity<UserSummaryResponse> me(Authentication authentication) {
        String email = authentication.getName();
        User u = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(new UserSummaryResponse(
                u.getId(),
                u.getFullName(),
                u.getEmail(),
                u.getPhone(),
                u.getRole().name()));
    }
}
