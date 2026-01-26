package com.ev.ampora_backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;


@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@Table(name = "users")
public class User {

    @Id
    @Column(name = "user_id", nullable = false)
    private String userId;

    private String fullName;
    private String email;
    private String phone;
    private String password;
    private String address;
    private String authProvider;

//    private boolean enabled;

    @Enumerated(EnumType.STRING)
    @Column(nullable = true)
    private Role role;

    // One user → One vehicle
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Vehicle> vehicles = new ArrayList<>();


    // Subscription
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private Subscription subscription;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private RFIDCard rfidCard;
}
