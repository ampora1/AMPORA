import React, { useMemo, useRef, useState } from "react";
import {
  GoogleMap,
  DirectionsRenderer,
  Polyline,
  Marker,
  Autocomplete,
  useLoadScript,
} from "@react-google-maps/api";
import { motion } from "framer-motion";

const API_BASE = "http://127.0.0.1:8000";
const containerStyle = { width: "100%", height: "100%" };

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

export default function TripPlanner() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  // UI
  const [loading, setLoading] = useState(false);
  const [renderMode, setRenderMode] = useState("osrm");

  // 🔥 NEW — Force map reload
  const [mapKey, setMapKey] = useState(0);

  // Inputs
  const [startText, setStartText] = useState("");
  const [endText, setEndText] = useState("");
  const [startGeo, setStartGeo] = useState(null);
  const [endGeo, setEndGeo] = useState(null);
  const [stops, setStops] = useState([]);

  // Google route
  const [directions, setDirections] = useState(null);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);

  // OSRM / backend
  const [stations, setStations] = useState([]);
  const [osrmPath, setOsrmPath] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);

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

  function fitToOsrmPath(coords) {
    if (!mapRef.current || !coords?.length) return;
    const bounds = new google.maps.LatLngBounds();
    coords.forEach(([lat, lon]) =>
      bounds.extend(new google.maps.LatLng(lat, lon))
    );
    mapRef.current.fitBounds(bounds, 60);
  }

  async function planRoute() {
    if (!isLoaded) return;

    setLoading(true);

    // 🔥 RESET MAP COMPLETELY — FIX BUG
    setMapKey((k) => k + 1); // <--- THE IMPORTANT FIX

    // Reset old route data
    setDirections(null);
    setSelectedRouteIndex(0);
    setOsrmPath([]);
    setStations([]);
    setRouteInfo(null);
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

      const resp = await fetch(`${API_BASE}/api/route`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start: s, end: e, stops: wp }),
      });
      const data = await resp.json();

      if (!data.success) {
        console.error("Backend error:", data.error);
        setOsrmPath([]);
        setStations([]);
      } else {
        const path = data.routes?.[0]?.path || [];
        setOsrmPath(path);
        setStations(data.nearby_stations || []);
        setRouteInfo(data.routes?.[0] || null);

        fitToOsrmPath(path);
      }

      setRenderMode("osrm");
    } catch (err) {
      console.error("Routing error:", err);
    } finally {
      setLoading(false);
    }
  }

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
              className="w-10 h-10 border-4 border-emerald-400 border-top border-t-transparent rounded-full mx-auto"
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

            {/* Render mode toggle (debug/QA) */}
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
            key={mapKey}               // 🔥 FORCE MAP RELOAD FIX
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
            {renderMode === "osrm" && osrmPath?.length > 0 && (
              <Polyline
                path={osrmPath.map(([lat, lon]) => ({ lat, lng: lon }))}
                options={{
                  geodesic: true,
                  strokeColor: "#10B981",
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

            {stations.map((s) => (
              <Marker
                key={s.station_id}
                position={{ lat: s.lat, lng: s.lon }}
                title={`${s.name} • ${s.max_power_kw || 0} kW`}
              />
            ))}
          </GoogleMap>
        )}
      </div>

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
              {stations.map((s) => (
                <div key={s.station_id} className="rounded-xl border border-emerald-200 bg-white p-3">
                  <p className="font-semibold">{s.name}</p>
                  <p className="text-xs text-emerald-900/70">{s.address || "—"}</p>
                  <div className="text-xs mt-1 text-emerald-900/80">
                    <div>Max Power: <b>{s.max_power_kw || 0} kW</b></div>
                    {s.distance_to_route_km != null && (
                      <div>Distance to route: <b>{s.distance_to_route_km} km</b></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
