package com.example.hospital_backend.service;

import com.example.hospital_backend.dto.response.NotificationResponse;
import com.example.hospital_backend.enums.NotificationType;

import java.util.List;

public interface NotificationService {

    void create(Long userId, NotificationType type, String title, String message);

    List<NotificationResponse> getMyNotifications();

    NotificationResponse markRead(Long notificationId);

    void markAllRead();
}