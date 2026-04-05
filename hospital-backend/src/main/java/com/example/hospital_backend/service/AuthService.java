package com.example.hospital_backend.service;

import com.example.hospital_backend.dto.request.LoginRequest;
import com.example.hospital_backend.dto.request.RegisterRequest;
import com.example.hospital_backend.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}