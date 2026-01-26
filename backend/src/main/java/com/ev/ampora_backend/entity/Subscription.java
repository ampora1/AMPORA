package com.ev.ampora_backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String subscriptionId;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String planName;   // Gold / Platinum / Basic
    private double monthlyFee;
    private boolean active;
}
