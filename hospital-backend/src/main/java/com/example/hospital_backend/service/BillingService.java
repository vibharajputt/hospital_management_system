package com.example.hospital_backend.service;

import com.example.hospital_backend.dto.request.BillingCreateRequest;
import com.example.hospital_backend.dto.request.BillingPayRequest;
import com.example.hospital_backend.dto.response.BillingResponse;

import java.util.List;

public interface BillingService {

    BillingResponse createBill(BillingCreateRequest request);

    List<BillingResponse> getMyBillsAsPatient();

    List<BillingResponse> getMyBillsAsDoctor();

    BillingResponse getByIdForCurrentUser(Long billingId);

    BillingResponse payMyBill(Long billingId, BillingPayRequest request);
}