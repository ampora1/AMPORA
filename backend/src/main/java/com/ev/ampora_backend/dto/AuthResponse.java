package com.ev.ampora_backend.dto;

import com.ev.ampora_backend.entity.Role;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class AuthResponse {
    private String token;
    private String user_id;
    private Role role;
}
