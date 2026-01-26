// src/main/java/com/ev/ampora_backend/dto/CreateBookingRequest.java
package com.ev.ampora_backend.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @Builder
@AllArgsConstructor @NoArgsConstructor
public class CreateBookingRequest {
    private String userId;
    private String chargerId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
