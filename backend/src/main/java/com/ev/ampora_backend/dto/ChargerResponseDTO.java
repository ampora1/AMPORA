package com.ev.ampora_backend.dto;

import com.ev.ampora_backend.entity.ChargerStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter @Builder
public class ChargerResponseDTO {
    private String chargerID;
    private String type;
    private double powerKw;
    private ChargerStatus status;
    private String stationName;
}
