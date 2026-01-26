package com.ev.ampora_backend.dto;

import com.ev.ampora_backend.entity.BookingStatus;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class BookingDTO {

    private String bookingId;

    private String userId;
    private String chargerId;

    private LocalDate date;

    private LocalTime startTime;
    private LocalTime endTime;
    private double amount;
    private String ChargerType;

    private BookingStatus status;
}
