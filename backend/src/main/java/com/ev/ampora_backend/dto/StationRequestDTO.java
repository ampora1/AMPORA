package com.ev.ampora_backend.dto;

import com.ev.ampora_backend.entity.StationStatus;
import lombok.Data;

@Data
public class StationRequestDTO {
    private String name;
    private String address;
    private double latitude;
    private double longitude;
    private StationStatus status;
    private String operatorId;
}
