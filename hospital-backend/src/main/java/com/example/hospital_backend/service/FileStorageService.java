package com.example.hospital_backend.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    String store(MultipartFile file, String folderName);

    Resource loadAsResource(String relativePath);
}