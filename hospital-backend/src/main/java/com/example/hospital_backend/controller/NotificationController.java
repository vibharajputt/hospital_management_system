package com.example.hospital_backend.controller;

import com.example.hospital_backend.dto.response.NotificationResponse;
import com.example.hospital_backend.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/my")
    public ResponseEntity<List<NotificationResponse>> my() {
        return ResponseEntity.ok(notificationService.getMyNotifications());
    }

    @PreAuthorize("isAuthenticated()")
    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> read(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markRead(id));
    }

    @PreAuthorize("isAuthenticated()")
    @PutMapping("/read-all")
    public ResponseEntity<?> readAll() {
        notificationService.markAllRead();
        return ResponseEntity.ok("All notifications marked as read");
    }
}