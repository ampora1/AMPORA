package com.ev.ampora_backend.dto;

import lombok.Data;

@Data
public class ChargingLiveDTO {

    // From ESP32
    private double current;   // A
    private double power;     // W
    private double energy;    // kWh
    private boolean charging;

    // Calculated server-side
    private double billLkr;
}
