package com.ev.ampora_backend.dto.payment;

public record PayHereHashResponse(
        String merchantId,
        String orderId,
        String amount,
        String currency,
        String hash
) {}
