// src/components/TripPlanner/TripPlanner.jsx
/* global google */
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  GoogleMap,
  DirectionsRenderer,
  Polyline,
  Marker,
  Autocomplete,
  useLoadScript,
} from "@react-google-maps/api";
import { motion } from "framer-motion";

const ML_API_BASE = "http://127.0.0.1:8000";
const BACKEND_API = "http://localhost:8083";
const containerStyle = { width: "100%", height: "100%" };

/* ---------------- Utilities ---------------- */

// Fallback text → lat/lng using Google Geocoding API
async function geocodeText(text, key) {
  if (!text) return null;
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      text
    )}&key=${key}`
  );
  const json = await res.json();
  if (json.status !== "OK" || !json.results?.length) return null;
  const loc = json.results[0].geometry.location;
  return { lat: loc.lat, lng: loc.lng };
}

// Pick the shortest (by distance, then duration) route from a Google DirectionsResult
function pickShortestRouteIndex(dirResult) {
  if (!dirResult?.routes?.length) return 0;
  let idxBest = 0;
  let metersBest = Infinity;
  let secondsBest = Infinity;

  dirResult.routes.forEach((r, i) => {
    const m = (r.legs || []).reduce((s, l) => s + (l.distance?.value || 0), 0);
    const s = (r.legs || []).reduce((s, l) => s + (l.duration?.value || 0), 0);
    if (m < metersBest || (m === metersBest && s < secondsBest)) {
      metersBest = m;
      secondsBest = s;
      idxBest = i;
    }
  });
  return idxBest;
}

// Try to extract userId from localStorage or JWT token payload
function getLoggedUserId() {
  const stored = localStorage.getItem("userId");
  if (stored) return stored;
  const token = localStorage.getItem("token");
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(atob(parts[1]));
    // adjust claim name if your JWT uses another key
    return payload?.userId || payload?.sub || payload?.uid || null;
  } catch {
    return null;
  }
}

/* ---------------- Component ---------------- */

export default function TripPlanner() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  // UI
  const [loading, setLoading] = useState(false);
  const [renderMode, setRenderMode] = useState("osrm"); // 'osrm' | 'google'
  const [mapKey, setMapKey] = useState(0); // force map reload

  // Inputs
  const [startText, setStartText] = useState("");
  const [endText, setEndText] = useState("");
  const [startGeo, setStartGeo] = useState(null);
  const [endGeo, setEndGeo] = useState(null);
  const [stops, setStops] = useState([]); // {id, text, location?}

  // Vehicles (from backend)
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);

  // Google route
  const [directions, setDirections] = useState(null);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);

  // OSRM / backend
  const [stations, setStations] = useState([]);
  const [bestStationIds, setBestStationIds] = useState(new Set());
  const [osrmPath, setOsrmPath] = useState([]); // [[lat,lon], ...]
  const [routeInfo, setRouteInfo] = useState(null);

  // Station modal
  const [selectedStation, setSelectedStation] = useState(null);

  // refs
  const acStartRef = useRef(null);
  const acEndRef = useRef(null);
  const stopRefs = useRef([]);
  const mapRef = useRef(null);

  const center = useMemo(() => ({ lat: 7.8731, lng: 80.7718 }), []);

  const onMapLoad = (map) => (mapRef.current = map);

  const onAutoComplete = (ref, setGeo, setText) => {
    const place = ref.current?.getPlace?.();
    if (!place?.geometry) return;
    const p = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };
    setGeo(p);
    if (place.formatted_address && setText) setText(place.formatted_address);
  };

  const addStop = () =>
    setStops((prev) => [...prev, { id: Date.now(), text: "", location: null }]);

  const removeStop = (id) =>
    setStops((prev) => prev.filter((s) => s.id !== id));

  // Add stop directly from modal (marker click)
  const addStopFromStation = (station) => {
    setStops((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: station.name || `${station.lat}, ${station.lon}`,
        location: { lat: station.lat, lng: station.lon },
      },
    ]);
    setSelectedStation(null);
  };

  function fitToOsrmPath(coords) {
    if (!mapRef.current || !coords?.length) return;
    const bounds = new google.maps.LatLngBounds();
    coords.forEach(([lat, lon]) =>
      bounds.extend(new google.maps.LatLng(lat, lon))
    );
    mapRef.current.fitBounds(bounds, 60);
  }

  // --------- Load vehicles for logged user ----------
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = getLoggedUserId();

    if (!userId || !token) return;

    (async () => {
      try {
        const res = await fetch(
          `${BACKEND_API}/api/vehicles/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        if (Array.isArray(data) && data.length) {
          setVehicles(data);
          setSelectedVehicleId(data[0].vehicleId); // default to first vehicle
        } else {
          setVehicles([]);
        }
      } catch (e) {
        console.error("Failed to load vehicles:", e);
      }
    })();
  }, []);

  const selectedVehicle = useMemo(
    () => vehicles.find((v) => v.vehicleId === selectedVehicleId) || null,
    [vehicles, selectedVehicleId]
  );

  // --------- Station scoring / best selection ----------
  function chooseBestStations(stationsList, routeSummary, vehicle) {
    if (!stationsList?.length || !routeSummary || !vehicle) {
      return new Set();
    }
    const distanceKm = Number(routeSummary.distance_km) || 0;
    const rangeKm = Number(vehicle.rangeKm) || 0; // full-charge range
    const connector = (vehicle.connectorType || "").toUpperCase();

    // How many stops likely needed (simple heuristic)
    const requiredStops = Math.max(0, Math.ceil(distanceKm / Math.max(1, rangeKm)) - 1);
    const K = Math.min(Math.max(requiredStops, 1), 5); // pick between 1..5

    // Score stations
    const scored = stationsList.map((s) => {
      const maxKw = s.max_power_kw || 0;
      const distR = s.distance_to_route_km ?? 999;
      const status = (s.status || "ACTIVE").toUpperCase();
      const name = (s.name || "").toUpperCase();

      let score = 0;
      // connector match (very important)
      if (name.includes(connector) || (s.connector_types || []).map(String).join("|").toUpperCase().includes(connector)) {
        score += 3;
      }
      // fast DC preference
      if (maxKw >= 90) score += 3;
      else if (maxKw >= 60) score += 2;
      else if (maxKw >= 22) score += 1;

      // near the route
      if (distR < 2) score += 2;
      else if (distR < 5) score += 1;

      // status
      if (status === "ACTIVE" || status === "OPEN") score += 1;

      return { s, score };
    });

    scored.sort((a, b) => b.score - a.score);

    const best = new Set(scored.slice(0, K).map((x) => x.s.station_id));
    return best;
  }

  /* ---------------- Main: Plan Route ---------------- */
  async function planRoute() {
    if (!isLoaded) return;

    setLoading(true);

    // 🔥 RESET MAP COMPLETELY — fixes leftover overlays after repeated plans
    setMapKey((k) => k + 1);

    // Reset old data
    setDirections(null);
    setSelectedRouteIndex(0);
    setOsrmPath([]);
    setStations([]);
    setBestStationIds(new Set());
    setRouteInfo(null);
    setSelectedStation(null);
    stopRefs.current = [];

    try {
      const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

      const s = startGeo || (await geocodeText(startText, key));
      const e = endGeo || (await geocodeText(endText, key));
      if (!s || !e) {
        alert("Please provide valid Start and Destination.");
        setLoading(false);
        return;
      }

      const wp = [];
      for (const st of stops) {
        if (st.location) wp.push(st.location);
        else if (st.text?.trim()) {
          const g = await geocodeText(st.text, key);
          if (g) wp.push(g);
        }
      }

      // Google route (for optional comparison / rendering)
      const svc = new google.maps.DirectionsService();
      const gResult = await svc.route({
        origin: s,
        destination: e,
        waypoints: wp.map((p) => ({ location: p, stopover: true })),
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true,
      });

      const bestIdx = pickShortestRouteIndex(gResult);
      setDirections(gResult);
      setSelectedRouteIndex(bestIdx);

      // OSRM route via ML backend
      const resp = await fetch(`${ML_API_BASE}/api/route`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start: s, end: e, stops: wp }),
      });
      const data = await resp.json();

      if (!data.success) {
        console.error("Backend error:", data.error);
        setOsrmPath([]);
        setStations([]);
        setBestStationIds(new Set());
      } else {
        const path = data.routes?.[0]?.path || [];
        setOsrmPath(path);
        setStations(data.nearby_stations || []);
        setRouteInfo(data.routes?.[0] || null);

        // Fit map to OSRM polyline (the one backend used)
        fitToOsrmPath(path);

        // Compute best stations using the selected vehicle
        if (selectedVehicle && data.routes?.[0]) {
          const bestIds = chooseBestStations(
            data.nearby_stations || [],
            data.routes[0],
            selectedVehicle
          );
          setBestStationIds(bestIds);
        }
      }

      setRenderMode("osrm");
    } catch (err) {
      console.error("Routing error:", err);
    } finally {
      setLoading(false);
    }
  }

  /* ---------------- Marker Icons ---------------- */
  // Simple SVG pins with two colors: emerald (best) and steel-blue (others)
  const svgPin = (hex) =>
    {
      const url =
        `data:image/svg+xml;charset=UTF-8,` +
        encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="${hex}" stroke="white" stroke-width="1.2">
            <path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/>
          </svg>
        `);
      return {
        url,
        scaledSize: new google.maps.Size(36, 36),
        anchor: new google.maps.Point(18, 36),
      };
    };

  const iconBest = isLoaded ? svgPin("#10B981") : undefined;   // emerald
  const iconOther = isLoaded ? svgPin("#3B82F6") : undefined;  // blue-500

  /* ---------------- Render ---------------- */
  return (
    <div className="w-screen min-h-screen mt-20 bg-gradient-to-b from-emerald-50 via-teal-50 to-white relative">
      {/* THINKING OVERLAY */}
      {loading && (
        <div className="absolute inset-0 bg-black/30 backdrop-blur-md z-50 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/90 px-10 py-6 rounded-2xl shadow-xl text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
              className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full mx-auto"
            />
            <p className="mt-3 text-emerald-700 font-semibold text-lg">Thinking…</p>
            <p className="text-xs text-emerald-600">
              Calculating optimal route & charging stations
            </p>
          </motion.div>
        </div>
      )}

      {/* INPUTS */}
      <div className="max-w-6xl mx-auto px-4 pt-6 space-y-4">
        {/* Vehicle selector */}
        <div className="bg-white/80 p-3 border border-emerald-200 rounded-xl">
          <label className="text-xs font-semibold text-emerald-700">Vehicle</label>
          <div className="mt-1">
            {vehicles.length === 0 ? (
              <div className="text-sm text-emerald-900/70">
                No vehicles found. Add one in{" "}
                <a href="/vehicles" className="underline text-emerald-700">Vehicle Manager</a>.
              </div>
            ) : (
              <select
                value={selectedVehicleId || ""}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full px-2 py-2 rounded-lg outline-none border border-emerald-300 bg-white/90 text-black"
              >
                {vehicles.map((v) => (
                  <option key={v.vehicleId} value={v.vehicleId}>
                    {v.brand_name} {v.model_name} • {Number(v.variant)} kWh • {v.connectorType} • {v.plate}
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedVehicle && (
            <div className="mt-2 text-xs text-emerald-900/80">
              <span className="mr-3">
                <b>Range:</b> {Number(selectedVehicle.rangeKm)} km
              </span>
              <span className="mr-3">
                <b>Battery:</b> {Number(selectedVehicle.variant)} kWh
              </span>
              <span>
                <b>Connector:</b> {selectedVehicle.connectorType}
              </span>
            </div>
          )}
        </div>

        {/* Start / End / Button */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-end">
          {/* START */}
          <div className="bg-white/80 p-3 border border-emerald-200 rounded-xl">
            <label className="text-xs font-semibold text-emerald-700">Start</label>
            {isLoaded && (
              <Autocomplete
                onLoad={(ref) => (acStartRef.current = ref)}
                onPlaceChanged={() =>
                  onAutoComplete(acStartRef, setStartGeo, setStartText)
                }
              >
                <input
                  className="w-full px-2 py-2 rounded-lg outline-none text-black"
                  placeholder="Colombo, Sri Lanka"
                  value={startText}
                  onChange={(e) => setStartText(e.target.value)}
                />
              </Autocomplete>
            )}
          </div>

          {/* DESTINATION */}
          <div className="bg-white/80 p-3 border border-emerald-200 rounded-xl">
            <label className="text-xs font-semibold text-emerald-700">
              Destination
            </label>
            {isLoaded && (
              <Autocomplete
                onLoad={(ref) => (acEndRef.current = ref)}
                onPlaceChanged={() =>
                  onAutoComplete(acEndRef, setEndGeo, setEndText)
                }
              >
                <input
                  className="w-full px-2 py-2 rounded-lg outline-none text-black"
                  placeholder="Kandy, Sri Lanka"
                  value={endText}
                  onChange={(e) => setEndText(e.target.value)}
                />
              </Autocomplete>
            )}
          </div>

          <button
            onClick={planRoute}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow"
          >
            Plan Trip
          </button>
        </div>

        {/* STOPS */}
        <div className="bg-white/70 p-4 rounded-xl border border-emerald-200">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-emerald-700 mb-2">Add More Stops</h3>

            {/* Render mode toggle */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-emerald-800/80">Render:</span>
              <button
                onClick={() => setRenderMode("osrm")}
                className={`px-3 py-1 rounded-lg border ${
                  renderMode === "osrm"
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "border-emerald-300 text-emerald-700"
                }`}
              >
                OSRM
              </button>
              <button
                onClick={() => setRenderMode("google")}
                className={`px-3 py-1 rounded-lg border ${
                  renderMode === "google"
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "border-emerald-300 text-emerald-700"
                }`}
              >
                Google
              </button>
            </div>
          </div>

          {stops.map((st, index) => (
            <div key={st.id} className="flex items-center gap-2 mb-2">
              <div className="flex-1 bg-white/80 p-2 border rounded-lg">
                <Autocomplete
                  onLoad={(ref) => (stopRefs.current[index] = ref)}
                  onPlaceChanged={() => {
                    const place = stopRefs.current[index].getPlace();
                    if (place?.geometry) {
                      const updated = [...stops];
                      updated[index].location = {
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng(),
                      };
                      updated[index].text =
                        place.formatted_address || updated[index].text;
                      setStops(updated);
                    }
                  }}
                >
                  <input
                    className="w-full px-2 py-2 rounded-lg outline-none text-black"
                    placeholder="Add stop…"
                    value={st.text}
                    onChange={(e) => {
                      const updated = [...stops];
                      updated[index].text = e.target.value;
                      setStops(updated);
                    }}
                  />
                </Autocomplete>
              </div>

              <button
                onClick={() => removeStop(st.id)}
                className="bg-red-500 text-white px-3 py-2 rounded-lg"
                title="Remove stop"
              >
                ✕
              </button>
            </div>
          ))}

          <button
            onClick={addStop}
            className="mt-2 px-4 py-2 border border-emerald-400 text-emerald-700 rounded-lg hover:bg-emerald-100"
          >
            + Add Stop
          </button>
        </div>
      </div>

      {/* MAP */}
      <div
        className={`max-w-6xl mx-auto h-[70vh] mt-4 rounded-2xl overflow-hidden border border-emerald-200 shadow ${
          loading ? "blur-sm" : ""
        }`}
      >
        {isLoaded && (
          <GoogleMap
            key={mapKey} // 🔥 FORCE MAP RELOAD FIX
            onLoad={onMapLoad}
            mapContainerStyle={containerStyle}
            center={startGeo || center}
            zoom={7}
            options={{
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
            }}
          >
            {/* OSRM polyline OR Google Directions */}
            {renderMode === "osrm" && osrmPath?.length > 0 && (
              <Polyline
                path={osrmPath.map(([lat, lon]) => ({ lat, lng: lon }))}
                options={{
                  geodesic: true,
                  strokeColor: "#10B981", // emerald-500
                  strokeOpacity: 0.95,
                  strokeWeight: 6,
                }}
              />
            )}

            {renderMode === "google" && directions && (
              <DirectionsRenderer
                directions={directions}
                options={{
                  routeIndex: selectedRouteIndex,
                  suppressMarkers: false,
                  polylineOptions: {
                    strokeOpacity: 0.9,
                    strokeWeight: 6,
                  },
                }}
              />
            )}

            {/* Station markers with modal trigger */}
            {stations.map((s) => {
              const isBest = bestStationIds.has(s.station_id);
              return (
                <Marker
                  key={s.station_id}
                  position={{ lat: s.lat, lng: s.lon }}
                  title={`${s.name} • ${s.max_power_kw || 0} kW`}
                  icon={isBest ? iconBest : iconOther}
                  onClick={() => setSelectedStation(s)}
                />
              );
            })}
          </GoogleMap>
        )}
      </div>

      {/* STATION POPUP MODAL */}
      {selectedStation && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[999] flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-md relative"
          >
            {/* Close */}
            <button
              onClick={() => setSelectedStation(null)}
              className="absolute top-3 right-3 text-gray-600 hover:text-black text-xl"
              aria-label="Close"
            >
              ×
            </button>

            <h2 className="text-xl font-bold text-emerald-700">
              {selectedStation.name}
            </h2>

            <p className="text-sm text-gray-700 mt-1">
              {selectedStation.address || "No address available"}
            </p>

            <div className="mt-4 space-y-2 text-gray-800 text-sm">
              <p><b>Max Power:</b> {selectedStation.max_power_kw || 0} kW</p>
              {selectedStation.distance_to_route_km != null && (
                <p><b>Distance from route:</b> {selectedStation.distance_to_route_km} km</p>
              )}
              <p><b>Latitude:</b> {selectedStation.lat}</p>
              <p><b>Longitude:</b> {selectedStation.lon}</p>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => addStopFromStation(selectedStation)}
                className="flex-1 bg-emerald-600 text-white py-2 rounded-lg shadow hover:bg-emerald-700"
              >
                Add as Stop
              </button>

              <button
                onClick={() => {
                  window.open(
                    `https://www.google.com/maps/dir/?api=1&destination=${selectedStation.lat},${selectedStation.lon}`,
                    "_blank"
                  );
                }}
                className="flex-1 bg-gray-200 text-gray-900 py-2 rounded-lg shadow hover:bg-gray-300"
              >
                Navigate
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* SUMMARY */}
      {routeInfo && (
        <div className="max-w-6xl mx-auto mt-6 grid md:grid-cols-3 gap-4 px-4 pb-10">
          <div className="bg-white/80 backdrop-blur p-4 rounded-xl border border-emerald-200">
            <h3 className="font-bold text-emerald-700">Route Summary</h3>
            <p className="mt-2 text-sm text-emerald-900/80">
              Distance: <b>{routeInfo.distance_km} km</b>
            </p>
            <p className="text-sm text-emerald-900/80">
              Duration: <b>{routeInfo.duration_min} min</b>
            </p>
          </div>
          <div className="md:col-span-2 bg-white/80 backdrop-blur p-4 rounded-xl border border-emerald-200">
            <h3 className="font-bold text-emerald-700">Nearby Stations</h3>
            <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {stations.map((s) => {
                const isBest = bestStationIds.has(s.station_id);
                return (
                  <div key={s.station_id} className={`rounded-xl border ${isBest ? "border-emerald-400" : "border-blue-200"} bg-white p-3`}>
                    <p className={`font-semibold ${isBest ? "text-emerald-700" : "text-blue-700"}`}>{s.name}</p>
                    <p className="text-xs text-emerald-900/70">{s.address || "—"}</p>
                    <div className="text-xs mt-1 text-emerald-900/80">
                      <div>Max Power: <b>{s.max_power_kw || 0} kW</b></div>
                      {s.distance_to_route_km != null && (
                        <div>Distance to route: <b>{s.distance_to_route_km} km</b></div>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedStation(s)}
                      className="mt-2 w-full text-sm px-3 py-2 rounded-lg border border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                    >
                      View details
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
