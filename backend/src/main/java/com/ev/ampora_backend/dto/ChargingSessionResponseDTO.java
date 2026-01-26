package com.ev.ampora_backend.dto;

import com.ev.ampora_backend.entity.SessionStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class ChargingSessionResponseDTO {
    private  String sessionId;
    private String userId;
    private String chargerId;
    private double energyUsedKwh;
    private double cost;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private SessionStatus sessionStatus;
}
