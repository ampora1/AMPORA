package com.ev.ampora_backend.service;

import com.ev.ampora_backend.entity.ChargingSession;
import com.ev.ampora_backend.entity.User;
import com.ev.ampora_backend.repository.ChargingSessionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ChargingSessionService {

    private final ChargingSessionRepository repo;
    private final WalletService walletService;
    private final UserService userService;

    // ⚠️ single live session (OK for now)
    private ChargingSession activeSession;

    public ChargingSessionService(
            ChargingSessionRepository repo,
            WalletService walletService,
            UserService userService
    ) {
        this.repo = repo;
        this.walletService = walletService;
        this.userService = userService;
    }

    /* ================= START SESSION ================= */
    public void startSession(String rfidUid) {

        if (activeSession != null) return;

        User user = userService.findByRfidUid(rfidUid);

        ChargingSession session = new ChargingSession();
        session.setUser(user);
        session.setRfidUid(rfidUid);
        session.setStartTime(LocalDateTime.now());
        session.setEnergyKwh(0);
        session.setStatus(ChargingSession.Status.LIVE);

        // ✅ PAYMENT MODE DECISION (THIS IS THE KEY)
        if (walletService.hasActiveWallet(user)) {
            session.setPaymentMode(ChargingSession.PaymentMode.WALLET);
            System.out.println("💳 WALLET MODE");
        } else {
            session.setPaymentMode(ChargingSession.PaymentMode.PAYG);
            System.out.println("💵 PAY-AS-YOU-GO MODE");
        }

        activeSession = repo.save(session);
        System.out.println("⚡ Charging session started");
    }

    /* ================= LIVE UPDATE ================= */
    public void updateEnergy(double energy) {
        if (activeSession == null) return;

        activeSession.setEnergyKwh(energy);
        repo.save(activeSession);
    }

    /* ================= END SESSION ================= */
    public ChargingSession endSession(double ratePerKwh) {
        if (activeSession == null) return null;

        activeSession.setEndTime(LocalDateTime.now());
        activeSession.setStatus(ChargingSession.Status.COMPLETED);

        double energy = activeSession.getEnergyKwh();

        if (activeSession.getPaymentMode() == ChargingSession.PaymentMode.WALLET) {

            // 🔥 deduct from wallet
            walletService.deductEnergy(
                    activeSession.getUser(),
                    energy
            );

            activeSession.setBillLkr(0);
            activeSession.setStatus(ChargingSession.Status.PAID);

        } else {

            // 💵 PAYG billing
            double bill = energy * ratePerKwh;
            activeSession.setBillLkr(bill);
        }

        ChargingSession finished = repo.save(activeSession);
        activeSession = null;

        System.out.println("✅ Charging session ended");
        return finished;
    }

    /* ================= LAST SESSION ================= */
    public ChargingSession getLastSession() {
        return repo.findTopByOrderByEndTimeDesc();
    }
}
