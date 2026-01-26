package com.ev.ampora_backend.controller;

import com.ev.ampora_backend.dto.AssignRFIDRequest;
import com.ev.ampora_backend.dto.RFIDResponse;
import com.ev.ampora_backend.entity.RFIDCard;
import com.ev.ampora_backend.service.RFIDService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rfid")
@CrossOrigin
public class RFIDController {

    private final RFIDService rfidService;

    public RFIDController(RFIDService rfidService) {
        this.rfidService = rfidService;
    }

    @PostMapping("/assign")
    public RFIDResponse assignRFID(@RequestBody AssignRFIDRequest request) {

        RFIDResponse response = rfidService.assignRFID(request);

        return response;
    }

    @GetMapping
    public List<RFIDResponse> getall(){

        List<RFIDResponse> response= rfidService.getallRFIDs();
        return response;
    }

    @PostMapping
    public  RFIDResponse response(@RequestBody AssignRFIDRequest request) {
        RFIDResponse response = rfidService.getUserRFID(request.getUid());
        return response;
    }
}
