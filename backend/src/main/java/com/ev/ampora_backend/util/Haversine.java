package com.ev.ampora_backend.util;

public class Haversine {

    private static final double EARTH_RADIUS = 6371.0;

    public static double distance(double lat1, double lng1, double lat2, double lng2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lng2 - lng1);

        double a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                        Math.cos(Math.toRadians(lat1)) *
                                Math.cos(Math.toRadians(lat2)) *
                                Math.sin(dLon / 2) *
                                Math.sin(dLon / 2);

        return EARTH_RADIUS * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    }
}