package com.ev.ampora_backend.repository;

import com.ev.ampora_backend.entity.Station;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StationRepository extends JpaRepository<Station,String> {
}
