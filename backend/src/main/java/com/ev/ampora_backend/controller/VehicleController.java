package com.ev.ampora_backend.controller;

import com.ev.ampora_backend.dto.VehicleDTO;
import com.ev.ampora_backend.entity.Vehicle;
import com.ev.ampora_backend.repository.VehicleRepository;
import com.ev.ampora_backend.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {
    @Autowired
  private VehicleService vehicleService;

  @PostMapping()
    public ResponseEntity<VehicleDTO> setVehicle (@RequestBody VehicleDTO dto){
      return ResponseEntity.ok(vehicleService.saveVehicle(dto));
  }

  @GetMapping
    public ResponseEntity<List<VehicleDTO>> getAllVehicle(){
      return ResponseEntity.ok(vehicleService.getAllVehicle());
  }

  @GetMapping("/{id}")
   public  ResponseEntity<VehicleDTO> getVehicleById(@PathVariable String id){
    return ResponseEntity.ok(vehicleService.getVehicleById(id));
  }
  


  @PutMapping("/{id}")
  public ResponseEntity<VehicleDTO> updateVehicle(@PathVariable String id,@RequestBody VehicleDTO dto){
    return ResponseEntity.ok(vehicleService.upDateVehicle(id,dto));
  }
  @DeleteMapping("/{id}")
  public  ResponseEntity<String> deleteVehicle(@PathVariable String id){
    vehicleService.deleteVehicle(id);
    return  ResponseEntity.ok("Delete vehicle successfully");
  }

  @GetMapping("/user/{userId}")
  public List<VehicleDTO> getVehicleByUser(@PathVariable String userId){
    return vehicleService.getVehicleByUserId(userId);
  }

}
