package com.ev.ampora_backend.service;

import com.ev.ampora_backend.entity.User;
import com.ev.ampora_backend.entity.UserPackageWallet;
import com.ev.ampora_backend.repository.UserPackageWalletRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class WalletService {

    @Autowired
    private UserPackageWalletRepository walletRepo;

    public boolean hasActiveWallet(User user) {
        return walletRepo.findByUserAndStatus(user, UserPackageWallet.Status.ACTIVE).isPresent();
    }

    public void deductEnergy(User user, double energyUsed) {
        UserPackageWallet wallet =
                (UserPackageWallet) walletRepo.findByUserAndStatus(user, UserPackageWallet.Status.ACTIVE)
                        .orElseThrow();

        wallet.setRemainingKwh(wallet.getRemainingKwh() - energyUsed);

        if (wallet.getRemainingKwh() <= 0) {
            wallet.setStatus(UserPackageWallet.Status.EXPIRED);
        }

        walletRepo.save(wallet);
    }
}

