package com.ev.ampora_backend.dto.route;

import com.ev.ampora_backend.entity.StationStatus;
import lombok.*;

@Data
@AllArgsConstructor
@Getter
@Setter
@Builder
public class StationDTO {
    private String stationId;
    private String name;
    private String address;
    private double lat;
    private double lon;
    private StationStatus status;
    private double powerKw;
    private double distanceToRouteKm;
    private double distanceFromStartKm;

    public StationDTO() {

    }
}
