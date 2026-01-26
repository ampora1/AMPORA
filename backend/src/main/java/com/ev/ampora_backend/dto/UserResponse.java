package com.ev.ampora_backend.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class UserResponse {
    private String userId;
    private String fullName;
    private String email;
    private String phone;
    private String role;
}
