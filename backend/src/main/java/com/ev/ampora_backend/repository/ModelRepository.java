package com.ev.ampora_backend.repository;
import com.ev.ampora_backend.entity.Model;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ModelRepository extends JpaRepository<Model, Long> {
}
