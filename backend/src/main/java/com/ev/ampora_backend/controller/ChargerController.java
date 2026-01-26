package com.ev.ampora_backend.controller;

import com.ev.ampora_backend.dto.ChargerRequestDTO;
import com.ev.ampora_backend.dto.ChargerResponseDTO;
import com.ev.ampora_backend.service.ChargerService;
import com.ev.ampora_backend.service.StationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/charger")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")

public class ChargerController {
    private final ChargerService chargerService;

    @PostMapping
    public ResponseEntity<ChargerResponseDTO> create(@RequestBody ChargerRequestDTO dto){
      return ResponseEntity.ok(chargerService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ChargerResponseDTO> update(@PathVariable String id,@RequestBody ChargerRequestDTO dto){
        return ResponseEntity.ok(chargerService.update(id, dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChargerResponseDTO> getchargerByid(@PathVariable String id){
        return ResponseEntity.ok(chargerService.getById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCharger(@PathVariable String id){
          chargerService.delete(id);
        return ResponseEntity.ok("Delete Successfully");
    }

    @GetMapping
    public ResponseEntity<List<ChargerResponseDTO>> getAll(){
        return ResponseEntity.ok(chargerService.getAll());
    }
}
