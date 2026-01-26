package com.ev.ampora_backend.service;

import com.ev.ampora_backend.dto.AuthResponse;
import com.ev.ampora_backend.dto.RegisterRequest;
import com.ev.ampora_backend.dto.UserDTO;
import com.ev.ampora_backend.entity.RFIDCard;
import com.ev.ampora_backend.entity.Role;
import com.ev.ampora_backend.entity.User;
import com.ev.ampora_backend.exception.ResourceNotFoundException;
import com.ev.ampora_backend.repository.RFIDCardRepository;
import com.ev.ampora_backend.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Encoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private  final RFIDCardRepository rfidCardRepository;


    public UserDTO register(RegisterRequest request) {


        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists!");
        }

        User user = User.builder()
                .userId(UUID.randomUUID().toString())
                .fullName(request.getFullName())
                .email(request.getEmail())
                .address(request.getAddress())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)

                .build();

        userRepository.save(user);

        return mapToDto(user);
    }
    public User findOrCreateGoogleUser(String email, String fullName) {

        return userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User user = new User();
                    user.setUserId(UUID.randomUUID().toString());
                    user.setEmail(email);
                    user.setFullName(fullName);
                    user.setAuthProvider("GOOGLE");
//                    user.setEnabled(true);
                    return userRepository.save(user);
                });
    }


    public AuthResponse login(String email, String password) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }
        Key key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
        String encodedKey = Encoders.BASE64.encode(key.getEncoded());

        String token = Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 86400000))  // 1 day
                .signWith(SignatureAlgorithm.HS256, encodedKey)
                .compact();


        AuthResponse response = new AuthResponse();

        response.setToken(token);
        response.setUser_id(user.getUserId());
        response.setRole(user.getRole());


        return response;
    }


    public List<UserDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    public UserDTO updateUser(String id, UserDTO user1) {
        User user = userRepository.findById(id).orElseThrow(() ->new RuntimeException("station not found"));
        user.setFullName(user1.getFullName());
        user.setEmail(user1.getEmail());
        user.setPhone(user1.getPhone());
        user.setAddress(user1.getAddress());
        userRepository.save(user);
        return mapToDto(user);


    }


    public UserDTO getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return mapToDto(user);
    }

    public List<UserDTO> getUserByName(String name) {
        List<User> users =
                userRepository.findByFullNameContainingIgnoreCase(name);

        if (users.isEmpty()) {
            throw new ResourceNotFoundException("No users found with name: " + name);
        }

        return users.stream()
                .map(this::mapToDto)
                .toList();
    }


    public void deleteUser(String Id) {
        if (!userRepository.existsById(Id)) {
            throw new ResourceNotFoundException("User not found");
        }
        userRepository.deleteById(Id);
    }


    private UserDTO mapToDto(User user) {
        return new UserDTO(
                user.getUserId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getAddress(),
                user.getRole()

        );
    }

    public User findByRfidUid(String rfidUid) {

        RFIDCard card = rfidCardRepository.findByUid(rfidUid)
                .orElseThrow(() ->
                        new RuntimeException("❌ RFID not registered: " + rfidUid)
                );

        return card.getUser();
    }

}
