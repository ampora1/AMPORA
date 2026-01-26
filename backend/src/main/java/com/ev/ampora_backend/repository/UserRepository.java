package com.ev.ampora_backend.repository;

import com.ev.ampora_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
    List<User> findByFullNameContainingIgnoreCase(String name);
    boolean existsByEmail(String email);

}
