// src/main/java/com/ev/ampora_backend/dto/UpdateBookingStatusRequest.java
package com.ev.ampora_backend.dto;

import com.ev.ampora_backend.entity.BookingStatus;
import lombok.*;

@Getter @Setter @Builder
@AllArgsConstructor @NoArgsConstructor
public class UpdateBookingStatusRequest {
    private BookingStatus status;
}
