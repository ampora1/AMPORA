package com.ev.ampora_backend.repository;

import com.ev.ampora_backend.entity.User;
import com.ev.ampora_backend.entity.UserPackageWallet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserPackageWalletRepository extends JpaRepository<UserPackageWallet, Long> {
    Optional<Object> findByUserAndStatus(User user, UserPackageWallet.Status status);
}
