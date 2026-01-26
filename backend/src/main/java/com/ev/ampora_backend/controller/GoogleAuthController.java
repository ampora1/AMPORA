//package com.ev.ampora_backend.controller;
//
//import com.ev.ampora_backend.entity.User;
//import com.ev.ampora_backend.repository.UserRepository;
//import com.ev.ampora_backend.service.GoogleAuthService;
//import com.ev.ampora_backend.util.JwtUtil;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.Map;
//
//@RestController
//@RequestMapping("/api/auth")
//@CrossOrigin(origins = "http://localhost:5173")
//public class GoogleAuthController {
//
//    private final GoogleAuthService googleAuthService;
//    private final UserRepository userRepo;
//    private final JwtUtil jwtUtil;
//
//    public GoogleAuthController(
//            GoogleAuthService googleAuthService,
//            UserRepository userRepo,
//            JwtUtil jwtUtil
//    ) {
//        this.googleAuthService = googleAuthService;
//        this.userRepo = userRepo;
//        this.jwtUtil = jwtUtil;
//    }
//
//    @PostMapping("/google")
//    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> body) throws Exception {
//
//        String token = body.get("token");
//
//        var payload = googleAuthService.verify(token);
//
//        String email = payload.getEmail();
//        String name = (String) payload.get("name");
//
//        User user = userRepo.findByEmail(email)
//                .orElseGet(() -> {
//                    User u = new User();
//                    u.setEmail(email);
//                    u.setFullName(name);
//
//                    return userRepo.save(u);
//                });
//
//        String jwt = jwtUtil.generateToken(user.getUserId());
//
//        return ResponseEntity.ok(Map.of(
//                "token", jwt,
//                "user_id", user.getUserId()
//        ));
//    }
//}
//
