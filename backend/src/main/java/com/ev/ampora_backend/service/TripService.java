package com.ev.ampora_backend.service;


import com.ev.ampora_backend.dto.StationAlongRoute;
import com.ev.ampora_backend.dto.TripResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;

@Service
public class TripService {

    private final RestTemplate rest = new RestTemplate();
    private final ObjectMapper om = new ObjectMapper();
    private final JdbcTemplate jdbc;
    private final String googleApiKey;

    public TripService(JdbcTemplate jdbc, @Value("${google.api.key:}") String googleApiKey) {
        this.jdbc = jdbc;
        this.googleApiKey = googleApiKey;
    }

    public TripResponse planTrip(double originLat, double originLng, double destLat, double destLng, int bufferMeters) throws Exception {
        // 1. call Google Directions
        String url = UriComponentsBuilder.fromHttpUrl("https://maps.googleapis.com/maps/api/directions/json")
                .queryParam("origin", originLat + "," + originLng)
                .queryParam("destination", destLat + "," + destLng)
                .queryParam("mode", "driving")
                .queryParam("alternatives", "false")
                .queryParam("key", googleApiKey)
                .toUriString();

        String googleJson = rest.getForObject(url, String.class);
        JsonNode root = om.readTree(googleJson);
        if (!root.path("status").asText().equals("OK")) {
            throw new IllegalStateException("Google Directions error: " + root.path("status").asText());
        }

        JsonNode route0 = root.path("routes").get(0);
        String overviewPolyline = route0.path("overview_polyline").path("points").asText();

        // total distance and duration (sum legs)
        long totalDistanceMeters = 0;
        long totalDurationSeconds = 0;
        for (JsonNode leg : route0.path("legs")) {
            totalDistanceMeters += leg.path("distance").path("value").asLong(0);
            totalDurationSeconds += leg.path("duration").path("value").asLong(0);
        }

        // 2. convert polyline to LINESTRING WKT (lon lat ordering)
        List<double[]> decoded = decodePolyline(overviewPolyline);
        if (decoded.size() < 2) throw new IllegalStateException("Polyline decode failed");

        StringBuilder sb = new StringBuilder();
        sb.append("LINESTRING(");
        for (int i = 0; i < decoded.size(); i++) {
            double lat = decoded.get(i)[0];
            double lng = decoded.get(i)[1];
            sb.append(lng).append(" ").append(lat); // NOTE: lon lat
            if (i < decoded.size() - 1) sb.append(",");
        }
        sb.append(")");
        String linestringWkt = sb.toString();

        // 3. run spatial query: get stations within bufferMeters of route, compute ST_Distance and ST_LineLocatePoint
        String sql = ""
                + "WITH route AS (SELECT ST_GeomFromText(? , 4326) as geom) "
                + "SELECT s.station_id, s.name, s.address, s.latitude, s.longitude, s.status, "
                + "       ST_Distance(ST_SetSRID(ST_MakePoint(s.longitude, s.latitude),4326)::geography, route.geom::geography) as distance_m, "
                + "       ST_LineLocatePoint(route.geom, ST_SetSRID(ST_MakePoint(s.longitude, s.latitude),4326)) as fraction "
                + "FROM station s, route "
                + "WHERE ST_DWithin(ST_SetSRID(ST_MakePoint(s.longitude, s.latitude),4326)::geography, route.geom::geography, ?) "
                + "ORDER BY fraction ASC";

        List<StationAlongRoute> stations = jdbc.query(sql, new Object[]{linestringWkt, bufferMeters}, new RowMapper<StationAlongRoute>() {
            @Override
            public StationAlongRoute mapRow(ResultSet rs, int rowNum) throws SQLException {
                StationAlongRoute s = new StationAlongRoute();
                s.stationId = rs.getString("station_id");
                s.name = rs.getString("name");
                s.address = rs.getString("address");
                s.latitude = rs.getDouble("latitude");
                s.longitude = rs.getDouble("longitude");
                s.status = rs.getString("status");
                s.distanceToRouteMeters = rs.getDouble("distance_m");
                s.fractionAlongRoute = rs.getDouble("fraction");
                return s;
            }
        });

        // 4. recommend stops with a simple greedy algorithm
        // convert station fraction -> distance_along_route_m = fraction * totalDistanceMeters
        List<Map<String, Object>> recommended = computeGreedyRecommendations(stations, totalDistanceMeters);

        // assemble response
        TripResponse resp = new TripResponse();
        Map<String,Object> routeInfo = new HashMap<>();
        routeInfo.put("overviewPolyline", overviewPolyline);
        routeInfo.put("distanceMeters", totalDistanceMeters);
        routeInfo.put("durationSeconds", totalDurationSeconds);
        resp.route = routeInfo;
        resp.stations = stations;
        resp.recommendedStops = recommended;
        return resp;
    }

    private List<Map<String,Object>> computeGreedyRecommendations(List<StationAlongRoute> stations, long totalDistanceMeters) {
        // parameters - tune as needed
        double vehicleRangeKm = 200.0; // example vehicle range in km
        double bufferKm = 20.0; // prefer to stop with this buffer
        double vehicleRangeMeters = vehicleRangeKm * 1000.0;
        double bufferMeters = bufferKm * 1000.0;

        List<Map<String,Object>> recs = new ArrayList<>();
        if (stations.isEmpty()) return recs;

        // track next allowed distance (start at 0)
        double lastStopDistance = 0.0;
        double remainingRange = vehicleRangeMeters; // naive: can travel vehicleRange before charging

        // We'll iterate through stations (already ordered by fraction along route)
        for (int i = 0; i < stations.size(); i++) {
            StationAlongRoute s = stations.get(i);
            double stationDistanceAlongRoute = s.fractionAlongRoute * totalDistanceMeters;
            double distanceFromLastStop = stationDistanceAlongRoute - lastStopDistance;

            // If this station is beyond remainingRange-buffer, we recommend this stop
            if (distanceFromLastStop > (remainingRange - bufferMeters)) {
                // recommend charging here
                Map<String,Object> m = new HashMap<>();
                m.put("stationId", s.stationId);
                m.put("name", s.name);
                m.put("latitude", s.latitude);
                m.put("longitude", s.longitude);
                // naive suggested charge minutes (estimate): assume 50kW charger and charge to 80%
                double chargeKWhNeeded = 50.0; // placeholder, production: compute using battery and soc
                double chargerKw = 50.0;
                double minutes = (chargeKWhNeeded / chargerKw) * 60.0;
                m.put("suggestedChargeMinutes", Math.round(minutes));
                // compute approximate ETA from origin using stationDistanceAlongRoute / avgSpeed (approx using route duration)
                // skip precise; we can put approx portion of total duration/ distance
                m.put("etaSecondsFromOrigin", (long) ((stationDistanceAlongRoute / (double)totalDistanceMeters) * 3600.0)); // rough
                recs.add(m);

                // reset remaining range from this stop (naive: full after charge)
                lastStopDistance = stationDistanceAlongRoute;
                remainingRange = vehicleRangeMeters;
            }
        }
        return recs;
    }

    // polyline decode (returns list of [lat,lng])
    private static List<double[]> decodePolyline(String encoded) {
        List<double[]> track = new ArrayList<>();
        int index = 0, len = encoded.length();
        int lat = 0, lng = 0;

        while (index < len) {
            int b, shift = 0, result = 0;
            do {
                b = encoded.charAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            int dlat = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
            lat += dlat;

            shift = 0;
            result = 0;
            do {
                b = encoded.charAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            int dlng = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
            lng += dlng;

            double latitude = lat / 1E5;
            double longitude = lng / 1E5;
            track.add(new double[]{latitude, longitude});
        }
        return track;
    }
}
