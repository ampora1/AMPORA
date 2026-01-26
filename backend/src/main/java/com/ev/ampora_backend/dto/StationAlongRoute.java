package com.ev.ampora_backend.dto;

public class StationAlongRoute {
    public String stationId;
    public String name;
    public String address;
    public double latitude;
    public double longitude;
    public String status;
    public double distanceToRouteMeters; // ST_Distance result
    public double fractionAlongRoute;
}
