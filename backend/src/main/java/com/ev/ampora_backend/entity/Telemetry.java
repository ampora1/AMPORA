package com.ev.ampora_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Telemetry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String telemetryId;

    private String chargerId;
    private double voltage;
    private double current;
    private double power;

    private LocalDateTime timestamp;
}
