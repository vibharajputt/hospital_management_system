package com.example.hospital_backend.dto.request;

import jakarta.validation.constraints.NotBlank;

public class BillingPayRequest {

    @NotBlank(message = "paymentMode is required (CASH/CARD/UPI/NETBANKING)")
    private String paymentMode;

    public BillingPayRequest() {
    }

    public String getPaymentMode() {
        return paymentMode;
    }

    public void setPaymentMode(String paymentMode) {
        this.paymentMode = paymentMode;
    }
}