package com.ev.ampora_backend.entity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Charger {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String chargerId;

    private String type;       // Fast / Slow
    private double powerKw;    // 7kW / 22kW / 50kW / 120kW

    @Enumerated(EnumType.STRING)
    private ChargerStatus status;

    @ManyToOne
    @JoinColumn(name = "station_id")
    private Station station;
}


