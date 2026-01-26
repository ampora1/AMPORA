package com.ev.ampora_backend.dto.route;

import lombok.Data;
import java.util.List;

@Data
public class RouteOptionsResponseDTO {
    private boolean success;
    private String error;
    private List<RouteOptionDTO> routes;
}