package com.ev.ampora_backend.service;

import com.ev.ampora_backend.dto.route.RouteOptionDTO;
import com.ev.ampora_backend.util.PolylineDecoder;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.json.JSONObject;

import java.util.*;

@Service
@RequiredArgsConstructor
public class GoogleMapsService {

    @Value("${google.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public List<RouteOptionDTO> getRouteOptions(String origin, String destination) {

        String url =
                "https://maps.googleapis.com/maps/api/directions/json?"
                        + "origin=" + origin
                        + "&destination=" + destination
                        + "&alternatives=true"
                        + "&key=" + apiKey;

        String response = restTemplate.getForObject(url, String.class);
        JSONObject obj = new JSONObject(response);

        if (!obj.getString("status").equals("OK")) {
            throw new RuntimeException("Google Directions failed: " + obj.optString("error_message"));
        }

        List<RouteOptionDTO> routes = new ArrayList<>();
        var jsonRoutes = obj.getJSONArray("routes");

        for (int i = 0; i < jsonRoutes.length(); i++) {

            var r = jsonRoutes.getJSONObject(i);
            var leg = r.getJSONArray("legs").getJSONObject(0);

            RouteOptionDTO dto = new RouteOptionDTO();
            dto.setSummary(r.optString("summary", "Route " + (i + 1)));
            dto.setDistanceKm(leg.getJSONObject("distance").getDouble("value") / 1000.0);
            dto.setDurationMin(leg.getJSONObject("duration").getDouble("value") / 60.0);

            String poly = r.getJSONObject("overview_polyline").getString("points");
            dto.setPolylinePoints(PolylineDecoder.decode(poly));

            routes.add(dto);
        }
        return routes;
    }
}
