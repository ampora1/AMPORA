package com.ev.ampora_backend.dto.route;

import lombok.Data;

@Data
public class ChargerDTO {
    private String chargerId;
    private String type;
    private double powerKw;
    private String status;
}