package com.example.hospital_backend.dto.response;

public class NotificationResponse {

    private Long id;
    private String type;
    private String title;
    private String message;
    private Boolean isRead;
    private String createdAt;

    public NotificationResponse() {
    }

    public Long getId() {
        return id;
    }

    public String getType() {
        return type;
    }

    public String getTitle() {
        return title;
    }

    public String getMessage() {
        return message;
    }

    public Boolean getIsRead() {
        return isRead;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setType(String type) {
        this.type = type;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setIsRead(Boolean read) {
        isRead = read;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}