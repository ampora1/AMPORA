package com.ev.ampora_backend.dto;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
@Data
public class PaymentRequestDTO {


        private String orderId;
        private double amount;
        private String currency;
        private String customerName;
        private String customerEmail;
        private String customerPhone;

}
