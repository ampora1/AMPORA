package com.ev.ampora_backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDateTime;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class InvoiceDto {
    private String invoiceId;
    private String userId;
    private LocalDateTime date;
    private double totalKwh;
    private double amount;
    private boolean paid;

}
