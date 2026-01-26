package com.ev.ampora_backend.service;

import com.ev.ampora_backend.dto.ChargerRequestDTO;
import com.ev.ampora_backend.dto.ChargerResponseDTO;

import java.util.List;

public interface ChargerService
{
    ChargerResponseDTO create(ChargerRequestDTO dto);
    ChargerResponseDTO update(String chargerId,ChargerRequestDTO dto);
    void delete(String chargerId);
    ChargerResponseDTO getById(String chargerId);
    List<ChargerResponseDTO> getAll();
}