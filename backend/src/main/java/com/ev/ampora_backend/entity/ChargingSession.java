package com.ev.ampora_backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "charging_session")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChargingSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String sessionId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String rfidUid;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    private double energyKwh;
    private double costLkr;

    @Enumerated(EnumType.STRING)
    private PaymentMode paymentMode;

    @Enumerated(EnumType.STRING)
    private Status status;

    public ChargingSession(LocalDateTime now) {
    }

    public void setBillLkr(double bill) {
    }

    public enum PaymentMode {
        PAYG,
        WALLET
    }

    public enum Status {
        LIVE,
        COMPLETED,
        PAID
    }
}
