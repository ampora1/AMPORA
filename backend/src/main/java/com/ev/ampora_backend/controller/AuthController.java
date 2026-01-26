package com.ev.ampora_backend.controller;

import com.ev.ampora_backend.dto.*;
import com.ev.ampora_backend.entity.User;
import com.ev.ampora_backend.service.GoogleAuthService;
import com.ev.ampora_backend.service.UserService;
import com.ev.ampora_backend.util.JwtUtil;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserService userService;
    private final GoogleAuthService googleAuthService;
    private final JwtUtil jwtService;

    @PostMapping("/register")
    public UserDTO register(@RequestBody RegisterRequest request) {
        return userService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {
        AuthResponse resp = userService.login(request.getEmail(), request.getPassword());
        return resp;
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> body) {

        String token = body.get("token");

        GoogleIdToken.Payload payload = googleAuthService.verify(token);

        String email = payload.getEmail();
        String name = (String) payload.get("name");

        User user = userService.findOrCreateGoogleUser(email, name);

        String jwt = jwtService.generateToken(user.getUserId());

        return ResponseEntity.ok(Map.of(
                "token", jwt,
                "user_id", user.getUserId()
        ));
    }

}
