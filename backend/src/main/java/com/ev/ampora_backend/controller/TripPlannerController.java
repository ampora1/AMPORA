package com.ev.ampora_backend.controller;

import com.ev.ampora_backend.dto.route.*;
import com.ev.ampora_backend.service.GoogleMapsService;
import com.ev.ampora_backend.service.StationMappingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/trip")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class TripPlannerController {

    private final GoogleMapsService googleMapsService;
    private final StationMappingService stationMappingService;

    @PostMapping("/options")
    public RouteOptionsResponseDTO getRouteOptions(@RequestBody RouteRequestDTO req) {
        RouteOptionsResponseDTO res = new RouteOptionsResponseDTO();
        try {
            var routes = googleMapsService.getRouteOptions(req.getStart(), req.getEnd());
            res.setSuccess(true);
            res.setRoutes(routes);
        } catch (Exception e) {
            res.setSuccess(false);
            res.setError(e.getMessage());
        }
        return res;
    }

    @PostMapping("/stations")
    public StationRouteResponseDTO getStationsForRoute(@RequestBody SelectedRouteDTO dto) {
        StationRouteResponseDTO res = new StationRouteResponseDTO();
        try {
            var stations = stationMappingService.mapStationsToRoute(dto.getPolylinePoints(), 5.0);
            res.setSuccess(true);
            res.setStations(stations);
        } catch (Exception e) {
            res.setSuccess(false);
            res.setError(e.getMessage());
        }
        return res;
    }
}
