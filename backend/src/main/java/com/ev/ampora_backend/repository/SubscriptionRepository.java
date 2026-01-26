package com.ev.ampora_backend.repository;

import com.ev.ampora_backend.entity.Subscription;
import com.ev.ampora_backend.entity.User;
import com.ev.ampora_backend.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SubscriptionRepository extends JpaRepository<Subscription,String> {
    Optional<Subscription> findByUser_UserId(String userId);

}
