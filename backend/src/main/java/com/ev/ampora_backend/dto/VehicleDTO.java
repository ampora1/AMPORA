package com.ev.ampora_backend.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class VehicleDTO {
    private String vehicleId;
    private Long brand_id;
    private String brand_name;
    private String model_name;
    private Long model_id;
    private double rangeKm;
    private double variant;
    private String connectorType;
    private String plate;
    private String userId;
}
