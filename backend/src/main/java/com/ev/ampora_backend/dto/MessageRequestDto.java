package com.ev.ampora_backend.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Data
public class MessageRequestDto {
    private String senderId;
    private String receiverId;
    private String subject;
    private String content;
}
