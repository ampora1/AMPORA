package com.ev.ampora_backend.controller;

import com.ev.ampora_backend.dto.TripResponse;
import com.ev.ampora_backend.service.TripService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class TripController {

    private final TripService service;

    public TripController(TripService service) { this.service = service; }

    @GetMapping("/trip")
    public TripResponse trip(
            @RequestParam double originLat,
            @RequestParam double originLng,
            @RequestParam double destLat,
            @RequestParam double destLng,
            @RequestParam(defaultValue = "5000") int bufferMeters
    ) throws Exception {
        return service.planTrip(originLat, originLng, destLat, destLng, bufferMeters);
    }
}

