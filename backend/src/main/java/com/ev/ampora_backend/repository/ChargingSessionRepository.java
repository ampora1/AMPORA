package com.ev.ampora_backend.repository;

import com.ev.ampora_backend.entity.ChargingSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.jar.JarEntry;

public interface ChargingSessionRepository extends JpaRepository<ChargingSession,String> {
    ChargingSession findTopByOrderByEndTimeDesc();
}
