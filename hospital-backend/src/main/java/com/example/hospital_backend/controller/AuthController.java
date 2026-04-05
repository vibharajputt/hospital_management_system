package com.example.hospital_backend.controller;

import com.example.hospital_backend.dto.request.LoginRequest;
import com.example.hospital_backend.dto.request.RegisterRequest;
import com.example.hospital_backend.dto.response.AuthResponse;
import com.example.hospital_backend.entity.User;
import com.example.hospital_backend.repository.UserRepository;
import com.example.hospital_backend.security.JwtUtil;
import com.example.hospital_backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public AuthController(AuthService authService, UserRepository userRepository, JwtUtil jwtUtil) {
        this.authService = authService;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
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
    public ResponseEntity<?> getCurrentUser(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(value = "token", required = false) String tokenParam) {
        try {
            String token = null;

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7).trim();
            }

            if ((token == null || token.isEmpty()) && tokenParam != null && !tokenParam.isBlank()) {
                token = tokenParam.trim();
            }

            if (token == null || token.isBlank()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token missing");
            }

            String email = jwtUtil.extractUsername(token);

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            return ResponseEntity.ok(user);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token: " + e.getMessage());
        }
    }
}