package com.ev.ampora_backend.repository;

import com.ev.ampora_backend.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BrandRepository extends JpaRepository<Brand, Long> {
  Optional<Brand> findById(Long id);
}
