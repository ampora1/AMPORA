//package com.ev.ampora_backend.controller;
//
//import com.ev.ampora_backend.entity.ChargingSession;
//import com.ev.ampora_backend.repository.ChargingSessionRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.PathVariable;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RestController;
//
//@RestController
//@RequestMapping("/api/charging-sessions")
//@RequiredArgsConstructor
//public class ChargingSessionController {
//
//    private final ChargingSessionRepository repo;
//
//    @GetMapping("/{id}")
//    public ChargingSession get(@PathVariable Long id) {
//        return repo.findById(id).orElseThrow();
//    }
//}
//

