package com.ev.ampora_backend.dto.route;

import lombok.Data;
import java.util.List;

@Data
public class RouteOptionDTO {
    private String summary;
    private double distanceKm;
    private double durationMin;
    private List<double[]> polylinePoints;
}
