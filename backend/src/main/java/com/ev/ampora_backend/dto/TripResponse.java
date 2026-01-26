package com.ev.ampora_backend.dto;
import java.util.List;
import java.util.Map;
public class TripResponse {
    public Map<String,Object> route; // contains overviewPolyline, distanceMeters, durationSeconds
    public List<StationAlongRoute> stations;
    public List<Map<String,Object>> recommendedStops;
}
