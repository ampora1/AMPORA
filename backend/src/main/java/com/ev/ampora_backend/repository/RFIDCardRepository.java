package com.ev.ampora_backend.repository;

import com.ev.ampora_backend.entity.RFIDCard;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RFIDCardRepository extends JpaRepository<RFIDCard, Long> {

    Optional<RFIDCard> findByUid(String uid);

    boolean existsByUid(String uid);

    boolean existsByUser_UserId(String userId);
}
