package com.ev.ampora_backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Station {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String stationId;

    private String name;
    private String address;

    private double latitude;
    private double longitude;

    @Enumerated(EnumType.STRING)
    private StationStatus status;

    // Operator (User)
    @ManyToOne
    @JoinColumn(name = "operator_id")
    private User operator;

    @OneToMany(mappedBy = "station", cascade = CascadeType.ALL)
    private List<Charger> chargers;
}
