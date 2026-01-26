package com.ev.ampora_backend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor @Builder
public class LoginRequest {
    private String email;
    private String password;
}
