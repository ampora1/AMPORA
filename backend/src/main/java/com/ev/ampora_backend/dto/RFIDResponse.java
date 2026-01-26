package com.ev.ampora_backend.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class RFIDResponse {

    private String userId;
    private String uid;
    private String rfid;
    private String username;
}
