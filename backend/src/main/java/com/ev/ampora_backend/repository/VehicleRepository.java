package com.ev.ampora_backend.repository;

import com.ev.ampora_backend.entity.User;
import com.ev.ampora_backend.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VehicleRepository extends JpaRepository<Vehicle,String> {
    List<Vehicle> findByUser_UserId(String userId);
}
