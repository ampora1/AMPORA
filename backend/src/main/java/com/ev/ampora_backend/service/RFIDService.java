package com.ev.ampora_backend.service;

import com.ev.ampora_backend.dto.AssignRFIDRequest;
import com.ev.ampora_backend.dto.RFIDResponse;
import com.ev.ampora_backend.entity.RFIDCard;
import com.ev.ampora_backend.entity.User;
import com.ev.ampora_backend.repository.RFIDCardRepository;
import com.ev.ampora_backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RFIDService {

    private final RFIDCardRepository rfidRepo;
    private final UserRepository userRepo;

    public RFIDService(RFIDCardRepository rfidRepo, UserRepository userRepo) {
        this.rfidRepo = rfidRepo;
        this.userRepo = userRepo;
    }

    private RFIDResponse toDTO(RFIDCard rfidCard) {
        return RFIDResponse.builder()
                .rfid(rfidCard.getUid())
                .username(rfidCard.getUser().getFullName())
                .userId(rfidCard.getUser().getUserId())
                .build();
    }
public List<RFIDResponse> getallRFIDs() {
       return rfidRepo.findAll().stream().map(this::toDTO).toList();

}

public RFIDResponse getUserRFID(String uid) {
        return rfidRepo.findByUid(uid).stream().map(this::toDTO).toList().get(0);
}
    public RFIDResponse assignRFID(AssignRFIDRequest req) {

        // 1️⃣ Validate user
        User user = userRepo.findById(req.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2️⃣ Prevent duplicate RFID
        if (rfidRepo.existsByUid(req.getUid())) {
            throw new RuntimeException("RFID already assigned");
        }

        // 3️⃣ Prevent multiple cards per user
        if (rfidRepo.existsByUser_UserId(user.getUserId())) {
            throw new RuntimeException("User already has an RFID card");
        }

        // 4️⃣ Assign card
        RFIDCard card = RFIDCard.builder()
                .uid(req.getUid())
                .user(user)
                .build();

        RFIDResponse response=RFIDResponse.builder()
                .rfid(req.getUid())
                .username(user.getFullName())
                .userId(user.getUserId())
                .build();

         rfidRepo.save(card);

         return  response;
    }
}
