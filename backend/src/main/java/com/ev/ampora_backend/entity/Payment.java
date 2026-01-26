package com.ev.ampora_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String paymentId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    // If payment is related to an invoice
    @ManyToOne
    @JoinColumn(name = "invoice_id", nullable = true)
    private Invoice invoice;

    // If payment is related to a charging session
    @ManyToOne
    @JoinColumn(name = "session_id", nullable = true)
    private ChargingSession session;

    private double amount;

    @Enumerated(EnumType.STRING)
    private PaymentMethod method; // CARD, ONLINE, RFID, CASH, SUBSCRIPTION

    @Enumerated(EnumType.STRING)
    private PaymentStatus status; // SUCCESS, PENDING, FAILED, REFUNDED

    private LocalDateTime timestamp;

    private String transactionId; // From payment gateway (Stripe, PayHere)
}
