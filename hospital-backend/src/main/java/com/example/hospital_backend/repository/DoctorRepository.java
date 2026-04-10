package com.example.hospital_backend.repository;

import com.example.hospital_backend.entity.Doctor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    Optional<Doctor> findByUserId(Long userId);

    List<Doctor> findBySpecializationContainingIgnoreCase(String specialization);

    @Query("""
                SELECT d FROM Doctor d
                WHERE (:spec IS NULL OR LOWER(d.specialization) LIKE LOWER(CONCAT('%', :spec, '%')))
                  AND (:dept IS NULL OR LOWER(d.department) LIKE LOWER(CONCAT('%', :dept, '%')))
                  AND (:minFee IS NULL OR d.consultationFee >= :minFee)
                  AND (:maxFee IS NULL OR d.consultationFee <= :maxFee)
            """)
    Page<Doctor> searchDoctors(
            @Param("spec") String specialization,
            @Param("dept") String department,
            @Param("minFee") Double minFee,
            @Param("maxFee") Double maxFee,
            Pageable pageable);
}