package com.ev.ampora_backend.util;

import org.apache.commons.math3.util.FastMath;

import java.util.List;

public class DistanceUtil {

    private static final double EARTH_RADIUS = 6371.0;

    private static double haversineKm(double[] p1, double[] p2) {

        double lat1 = p1[0], lon1 = p1[1];
        double lat2 = p2[0], lon2 = p2[1];

        double dLat = FastMath.toRadians(lat2 - lat1);
        double dLon = FastMath.toRadians(lon2 - lon1);

        double a = FastMath.sin(dLat / 2) * FastMath.sin(dLat / 2)
                + FastMath.cos(FastMath.toRadians(lat1))
                * FastMath.cos(FastMath.toRadians(lat2))
                * FastMath.sin(dLon / 2) * FastMath.sin(dLon / 2);

        double c = 2 * FastMath.atan2(FastMath.sqrt(a), FastMath.sqrt(1 - a));
        return EARTH_RADIUS * c;
    }

    private static double distanceToSegmentKm(double[] p, double[] a, double[] b) {
        double dPA = haversineKm(p, a);
        double dPB = haversineKm(p, b);
        double[] mid = new double[]{(a[0] + b[0]) / 2, (a[1] + b[1]) / 2};
        double dPM = haversineKm(p, mid);
        return Math.min(dPA, Math.min(dPB, dPM));
    }

    public static double minDistanceToPolylineKm(double[] p, List<double[]> path) {

        double min = Double.MAX_VALUE;

        for (int i = 0; i < path.size() - 1; i++) {
            double d = distanceToSegmentKm(p, path.get(i), path.get(i + 1));
            if (d < min) min = d;
        }
        return min;
    }
    public static double distanceFromStartKm(
            double[] stationPoint,
            List<double[]> path
    ) {
        double total = 0.0;

        for (int i = 0; i < path.size() - 1; i++) {
            double[] a = path.get(i);
            double[] b = path.get(i + 1);

            // distance of this route segment
            double segmentKm = haversineKm(a, b);

            // if station is close enough to this segment, stop here
            double distToSegment = distanceToSegmentKm(stationPoint, a, b);

            if (distToSegment < 0.1) { // ~100m tolerance
                return total;
            }

            total += segmentKm;
        }

        return total;
    }
}
