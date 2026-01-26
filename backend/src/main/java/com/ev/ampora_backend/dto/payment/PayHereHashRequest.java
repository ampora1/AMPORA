package com.ev.ampora_backend.dto.payment;

import lombok.Data;

@Data
public class PayHereHashRequest {
    private String orderId;
    private String amount;
    private String currency;
}
