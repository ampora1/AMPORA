package com.ev.ampora_backend.dto;

import com.ev.ampora_backend.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserDTO {
    private String userId;
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private Role role;


}
