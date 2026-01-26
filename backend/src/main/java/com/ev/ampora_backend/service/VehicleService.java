package com.ev.ampora_backend.service;

import com.ev.ampora_backend.dto.StationRequestDTO;
import com.ev.ampora_backend.dto.StationResponseDTO;
import com.ev.ampora_backend.dto.VehicleDTO;
import com.ev.ampora_backend.entity.*;
import com.ev.ampora_backend.repository.BrandRepository;
import com.ev.ampora_backend.repository.ModelRepository;
import com.ev.ampora_backend.repository.UserRepository;
import com.ev.ampora_backend.repository.VehicleRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import static java.util.stream.Collectors.toList;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepo;
    private final UserRepository userRepo;
    private final BrandRepository brandRepo;
    private final ModelRepository modelRepo;

    // SAVE
    public VehicleDTO saveVehicle(VehicleDTO dto) {

        Vehicle v = new Vehicle();
        v.setVariant(dto.getVariant());
        v.setPlate(dto.getPlate());
        v.setRangeKm((Double) dto.getRangeKm());
        v.setConnectorType(dto.getConnectorType());
        v.setUser(userRepo.findById(dto.getUserId()).orElseThrow());
        v.setBrand(brandRepo.findById(dto.getBrand_id()).orElseThrow());
        v.setModel(modelRepo.findById(dto.getModel_id()).orElseThrow());

        return toDTO(vehicleRepo.save(v));
    }

    // GET ALL
    public List<VehicleDTO> getAllVehicle() {
        return vehicleRepo.findAll().stream().map(this::toDTO).toList();
    }

    // GET BY ID
    public VehicleDTO getVehicleById(String id) {
        return toDTO(vehicleRepo.findById(id).orElseThrow());
    }

    // UPDATE
    public VehicleDTO upDateVehicle(String id, VehicleDTO dto) {

        Vehicle v = vehicleRepo.findById(id).orElseThrow();

        if(dto.getPlate()!=null) v.setPlate(dto.getPlate());
        if(dto.getRangeKm()!=0) v.setRangeKm((double) dto.getRangeKm());
        if(dto.getVariant()!=0) v.setVariant(dto.getVariant());
        if(dto.getConnectorType()!=null) v.setConnectorType(dto.getConnectorType());

        if(dto.getUserId()!=null) v.setUser(userRepo.findById(dto.getUserId()).orElse(v.getUser()));
        if(dto.getBrand_id()!=null) v.setBrand(brandRepo.findById(dto.getBrand_id()).orElse(v.getBrand()));
        if(dto.getModel_id()!=null) v.setModel(modelRepo.findById(dto.getModel_id()).orElse(v.getModel()));

        return toDTO(vehicleRepo.save(v));
    }

    // DELETE
    public void deleteVehicle(String id) {
        vehicleRepo.deleteById(id);
    }

    // GET BY USER
    public List<VehicleDTO> getVehicleByUserId(String userId) {
        return vehicleRepo.findByUser_UserId(userId).stream().map(this::toDTO).toList();
    }

    // ENTITY → DTO
    private VehicleDTO toDTO(Vehicle v){
        return VehicleDTO.builder()
                .vehicleId(v.getVehicleId())
                .variant(v.getVariant())
                .plate(v.getPlate())
                .rangeKm(v.getRangeKm())
                .connectorType(v.getConnectorType())
                .userId(v.getUser().getUserId())
                .brand_id(v.getBrand().getId())
                .brand_name(v.getBrand().getName())
                .model_id(v.getModel().getId())
                .model_name(v.getModel().getName())
                .build();
    }
}
