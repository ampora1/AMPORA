package com.ev.ampora_backend.dto.route;

import lombok.Data;

import java.util.List;

@Data
public class SelectedRouteDTO {
    private List<double[]> polylinePoints;
}
