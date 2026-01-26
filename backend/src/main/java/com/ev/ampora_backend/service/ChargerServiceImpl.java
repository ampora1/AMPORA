package com.ev.ampora_backend.service;


import com.ev.ampora_backend.dto.ChargerRequestDTO;
import com.ev.ampora_backend.dto.ChargerResponseDTO;
import com.ev.ampora_backend.entity.Charger;
import com.ev.ampora_backend.entity.Station;
import com.ev.ampora_backend.repository.ChargerRepository;
import com.ev.ampora_backend.repository.StationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public  class ChargerServiceImpl implements  ChargerService{
    private final ChargerRepository chargerRepo;
    private final StationRepository stationRepo;


    private ChargerResponseDTO toresponse(Charger c){

        Station station = stationRepo.findById(c.getStation().getStationId()).orElseThrow(() -> new RuntimeException("Station not found"));
        return ChargerResponseDTO.builder().chargerID(c.getChargerId()).type(c.getType()).powerKw(c.getPowerKw()).status(c.getStatus()).stationName(station.getName()).build();
    }

    @Override
    public ChargerResponseDTO create(ChargerRequestDTO dto) {
        Station station = stationRepo.findById(dto.getStationId()).orElseThrow(() -> new RuntimeException("Station not found"));
        Charger charger=Charger.builder().type(dto.getType()).powerKw(dto.getPowerKw()).status(dto.getStatus()).station(station).build();
        chargerRepo.save(charger);
       return toresponse(charger);
    }

    @Override
    public ChargerResponseDTO update(String chargerId, ChargerRequestDTO dto) {
        Charger c =chargerRepo.findById(chargerId).orElseThrow(() ->new RuntimeException("Charger Not found") );
        Station s =stationRepo.findById(dto.getStationId()).orElseThrow(() -> new RuntimeException("Station Not found"));
        c.setType(dto.getType());
        c.setPowerKw(dto.getPowerKw());
        c.setStatus(dto.getStatus());
        c.setStation(s);
        chargerRepo.save(c);

        return toresponse(c);
    }

    @Override
    public void delete(String chargerId) {
      chargerRepo.deleteById(chargerId);

      }


    @Override
    public ChargerResponseDTO getById(String chargerId) {
     Charger c=   chargerRepo.findById(chargerId).orElseThrow(() -> new RuntimeException("Charger Not found"));
     return  toresponse(c);
    }

    @Override
    public List<ChargerResponseDTO> getAll() {
        return chargerRepo.findAll().stream().map(this::toresponse).toList();

    }
}
