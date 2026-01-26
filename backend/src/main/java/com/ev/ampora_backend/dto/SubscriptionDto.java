package com.ev.ampora_backend.dto;

import lombok.*;

@Getter@Setter
@AllArgsConstructor@NoArgsConstructor@Builder
public class SubscriptionDto {
    private String subscriptionId;
    private String userId;
    private String planName;
    private double monthlyFree;
    private boolean active;
}
