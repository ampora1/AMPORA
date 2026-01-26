package com.ev.ampora_backend.dto;

import com.ev.ampora_backend.entity.StationStatus;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class StationResponseDTO {
    private String stationId;
    private String name;
    private String address;
    private double latitude;
    private double longitude;
    private StationStatus status;
    private List<ChargerResponseDTO> chargers;
}
