package com.ev.ampora_backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "user_package_wallet")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserPackageWallet {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String walletId;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    private double remainingKwh;

    private LocalDate startDate;
    private LocalDate expiryDate;

    @Enumerated(EnumType.STRING)
    private Status status;

    public enum Status {
        ACTIVE,
        EXPIRED
    }
}

