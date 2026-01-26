package com.ev.ampora_backend.dto;

import com.ev.ampora_backend.entity.ChargerStatus;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class ChargerRequestDTO {
    private String type;
    private double powerKw;
    private ChargerStatus status;
    private String stationId;
}
