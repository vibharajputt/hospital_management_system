package com.example.hospital_backend.service.impl;

import com.example.hospital_backend.exception.ResourceNotFoundException;
import com.example.hospital_backend.service.FileStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Override
    public String store(MultipartFile file, String folderName) {
        try {
            String original = StringUtils
                    .cleanPath(file.getOriginalFilename() == null ? "file" : file.getOriginalFilename());
            String filename = UUID.randomUUID() + "_" + original;

            Path folder = Paths.get(uploadDir).resolve(folderName).normalize();
            Files.createDirectories(folder);

            Path target = folder.resolve(filename).normalize();
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            // return relative path to store in DB
            return folderName + "/" + filename;

        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + e.getMessage());
        }
    }

    @Override
    public Resource loadAsResource(String relativePath) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(relativePath).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable())
                return resource;
            throw new ResourceNotFoundException("File not found");
        } catch (MalformedURLException e) {
            throw new ResourceNotFoundException("File not found");
        }
    }
}