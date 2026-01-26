package com.ev.ampora_backend.controller;

import com.ev.ampora_backend.dto.StationRequestDTO;
import com.ev.ampora_backend.dto.StationResponseDTO;
import com.ev.ampora_backend.entity.Station;
import com.ev.ampora_backend.service.StationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/station")
@RequiredArgsConstructor
public class StationController {
    private final StationService stationService;

    @PostMapping
    public boolean create(@RequestBody StationRequestDTO dto){
        return stationService.create(dto);
    }

    @GetMapping
    public ResponseEntity<List<StationResponseDTO>> getAll(){
        return ResponseEntity.ok(stationService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<StationResponseDTO> getOne(@PathVariable String id){
        return ResponseEntity.ok(stationService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StationResponseDTO> update(@PathVariable String id,@RequestBody StationRequestDTO dto){
        return ResponseEntity.ok(stationService.update(id, dto));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable String id){
        stationService.delete(id);
        return ResponseEntity.ok("Station Deleted");
    }

}
