package com.ev.ampora_backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "charging_package")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChargingPackage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String packageId;

    private String name; // BASIC, PREMIUM, ENTERPRISE
    private double kwhAmount;
    private double priceLkr;
    private int validityDays; // 30
}

