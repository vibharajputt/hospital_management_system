package com.example.hospital_backend.service.impl;

import com.example.hospital_backend.dto.response.NotificationResponse;
import com.example.hospital_backend.entity.Notification;
import com.example.hospital_backend.entity.User;
import com.example.hospital_backend.enums.NotificationType;
import com.example.hospital_backend.exception.ForbiddenException;
import com.example.hospital_backend.exception.ResourceNotFoundException;
import com.example.hospital_backend.repository.NotificationRepository;
import com.example.hospital_backend.repository.UserRepository;
import com.example.hospital_backend.service.NotificationService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationServiceImpl(NotificationRepository notificationRepository,
            UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Override
    public void create(Long userId, NotificationType type, String title, String message) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Notification n = new Notification();
        n.setUser(user);
        n.setType(type);
        n.setTitle(title);
        n.setMessage(message);
        n.setIsRead(false);

        notificationRepository.save(n);
    }

    @Override
    public List<NotificationResponse> getMyNotifications() {
        User me = currentUser();

        return notificationRepository.findByUserIdOrderByCreatedAtDesc(me.getId())
                .stream().map(this::map)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public NotificationResponse markRead(Long notificationId) {
        User me = currentUser();

        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!n.getUser().getId().equals(me.getId())) {
            throw new ForbiddenException("You cannot modify another user's notification");
        }

        n.setIsRead(true);
        return map(notificationRepository.save(n));
    }

    @Override
    @Transactional
    public void markAllRead() {
        User me = currentUser();
        List<Notification> list = notificationRepository.findByUserIdOrderByCreatedAtDesc(me.getId());
        for (Notification n : list)
            n.setIsRead(true);
        notificationRepository.saveAll(list);
    }

    private NotificationResponse map(Notification n) {
        NotificationResponse r = new NotificationResponse();
        r.setId(n.getId());
        r.setType(n.getType().name());
        r.setTitle(n.getTitle());
        r.setMessage(n.getMessage());
        r.setIsRead(n.getIsRead());
        r.setCreatedAt(n.getCreatedAt() != null ? n.getCreatedAt().toString() : null);
        return r;
    }
}