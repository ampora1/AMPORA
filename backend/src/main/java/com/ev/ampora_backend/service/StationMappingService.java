package com.ev.ampora_backend.service;

import com.ev.ampora_backend.dto.route.StationDTO;
import com.ev.ampora_backend.entity.Station;
import com.ev.ampora_backend.repository.StationRepository;
import com.ev.ampora_backend.util.DistanceUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class StationMappingService {

    private final StationRepository stationRepository;

    public List<StationDTO> mapStationsToRoute(List<double[]> path, double maxDistanceKm) {

        List<Station> stations = stationRepository.findAll();
        List<StationDTO> result = new ArrayList<>();

        for (Station s : stations) {
            double[] stationPoint = { s.getLatitude(), s.getLongitude() };

            double minDist = DistanceUtil.minDistanceToPolylineKm(stationPoint, path);

            if (minDist <= maxDistanceKm) {

                double distanceFromStart =
                        DistanceUtil.distanceFromStartKm(
                                stationPoint, path
                        );

                StationDTO dto = new StationDTO();
                dto.setStationId(s.getStationId());
                dto.setName(s.getName());
                dto.setAddress(s.getAddress());
                dto.setStatus(s.getStatus());
                dto.setLat(s.getLatitude());
                dto.setLon(s.getLongitude());
                dto.setPowerKw(
                        s.getChargers().stream()
                                .mapToDouble(c -> c.getPowerKw())
                                .max().orElse(0)
                );
                dto.setDistanceToRouteKm(
                        Math.round(minDist * 100.0) / 100.0
                );
                dto.setDistanceFromStartKm(
                        Math.round(distanceFromStart * 100.0) / 100.0
                );

                result.add(dto);
            }
        }

        // IMPORTANT: sort by distance from START, not distance to route
        result.sort(Comparator.comparing(StationDTO::getDistanceFromStartKm));

        return result;
    }

}