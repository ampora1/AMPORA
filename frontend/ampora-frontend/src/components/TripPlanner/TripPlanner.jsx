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
import TripPlannerStationCard from "./TripPlannerStationCard";
import herobg from "../../assets/hero-bg1.png";
import { motion } from "framer-motion";

const ML_API_BASE = "http://127.0.0.1:8000";
const BACKEND_API = "http://localhost:8083";
const containerStyle = { width: "100%", height: "100%" };

/* ---------------- Utilities ---------------- */

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

function getLoggedUserId() {
  const stored = localStorage.getItem("userId");
  if (stored) return stored;
  const token = localStorage.getItem("token");
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(atob(parts[1]));
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
  const [mapKey, setMapKey] = useState(0);

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

  // Toast
  const [toast, setToast] = useState(null); // {type:'success'|'error', text:'...'}

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

  // Load vehicles for logged user
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = getLoggedUserId();

    if (!userId || !token) return;

    (async () => {
      try {
        const res = await fetch(`${BACKEND_API}/api/vehicles/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (Array.isArray(data) && data.length) {
          setVehicles(data);
          setSelectedVehicleId(data[0].vehicleId);
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

  // Station scoring / best selection
  function chooseBestStations(stationsList, routeSummary, vehicle) {
    if (!stationsList?.length || !routeSummary || !vehicle) {
      return new Set();
    }
    const distanceKm = Number(routeSummary.distance_km) || 0;
    const rangeKm = Number(vehicle.rangeKm) || 0;
    const connector = (vehicle.connectorType || "").toUpperCase();

    const requiredStops = Math.max(
      0,
      Math.ceil(distanceKm / Math.max(1, rangeKm)) - 1
    );
    const K = Math.min(Math.max(requiredStops, 1), 5);

    const scored = stationsList.map((s) => {
      const maxKw = s.max_power_kw || 0;
      const distR = s.distance_to_route_km ?? 999;
      const status = (s.status || "ACTIVE").toUpperCase();
      const name = (s.name || "").toUpperCase();

      let score = 0;
      // connector match
      if (
        name.includes(connector) ||
        (s.connector_types || [])
          .map(String)
          .join("|")
          .toUpperCase()
          .includes(connector)
      ) {
        score += 3;
      }
      // fast chargers
      if (maxKw >= 90) score += 3;
      else if (maxKw >= 60) score += 2;
      else if (maxKw >= 22) score += 1;

      // proximity to route
      if (distR < 2) score += 2;
      else if (distR < 5) score += 1;

      // open
      if (status === "ACTIVE" || status === "OPEN") score += 1;

      return { s, score };
    });

    scored.sort((a, b) => b.score - a.score);

    const best = new Set(scored.slice(0, K).map((x) => x.s.station_id));
    return best;
  }

  /* ---------------- Plan Route ---------------- */
  async function planRoute() {
    if (!isLoaded) return;

    setLoading(true);

    // reset map overlays and state
    setMapKey((k) => k + 1);
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
        setToast({ type: "error", text: "Please enter a valid start and destination." });
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

      // Google route
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

      // OSRM + stations (ML backend)
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
        setToast({ type: "error", text: "Route service unavailable." });
      } else {
        const path = data.routes?.[0]?.path || [];
        setOsrmPath(path);
        setStations(data.nearby_stations || []);
        setRouteInfo(data.routes?.[0] || null);

        fitToOsrmPath(path);

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
      setToast({ type: "success", text: "Route planned successfully." });
    } catch (err) {
      console.error("Routing error:", err);
      setToast({ type: "error", text: "Failed to plan route." });
    } finally {
      setLoading(false);
    }
  }

  /* ---------------- Save Trip ---------------- */
  async function saveTrip() {
    if (!routeInfo || !selectedVehicle) {
      setToast({ type: "error", text: "Plan a route and select a vehicle first." });
      return;
    }
    const token = localStorage.getItem("token");
    const userId = getLoggedUserId();
    const payload = {
      userId,
      vehicleId: selectedVehicle.vehicleId,
      start: { text: startText, geo: startGeo },
      end: { text: endText, geo: endGeo },
      stops,
      route: routeInfo,
      recommendedStationIds: Array.from(bestStationIds),
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(`${BACKEND_API}/api/trips`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setToast({ type: "success", text: "Trip saved to your account." });
        return;
      }
      throw new Error(`HTTP ${res.status}`);
    } catch {
      // fallback to local storage
      const existing = JSON.parse(localStorage.getItem("savedTrips") || "[]");
      existing.unshift({ id: crypto.randomUUID(), ...payload });
      localStorage.setItem("savedTrips", JSON.stringify(existing));
      setToast({ type: "success", text: "Backend unavailable. Trip saved locally." });
    }
  }

  /* ---------------- Marker Icons ---------------- */
  const svgPin = (hex) => {
    if (!isLoaded || !window.google) return undefined;
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
  const iconBest = svgPin("#22C55E");  // green for recommended
  const iconOther = svgPin("#EF4444"); // red default

  /* ---------------- Render ---------------- */
  return (
    <div className="w-screen min-h-screen bg-neutral-50 text-slate-900">
      <div
      className="mt-20 w-full h-[200px] bg-cover bg-center relative flex items-center justify-center"
      style={{ backgroundImage: `url(${herobg})` }}
    >
      {/* overlay */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Electric animated line */}
      <div className="electric-line"></div>

      {/* Main animated text */}
      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative text-4xl md:text-6xl font-bold text-white text-center drop-shadow-xl"
      >
        Plan your trip with ease
      </motion.h1>
    </div>

      <header className=" z-40 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="font-semibold text-lg">Trip Planner</div>
          <div className="text-xs text-slate-500 hidden sm:block">
            Plan your EV route, pick stations, and save trips.
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setRenderMode("osrm")}
              className={`px-3 py-1.5 rounded-lg text-sm border ${
                renderMode === "osrm"
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-slate-700 border-slate-300"
              }`}
            >
              OSRM
            </button>
            <button
              onClick={() => setRenderMode("google")}
              className={`px-3 py-1.5 rounded-lg text-sm border ${
                renderMode === "google"
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-slate-700 border-slate-300"
              }`}
            >
              Google
            </button>
            <button
              onClick={saveTrip}
              className="ml-1 px-3 py-1.5 rounded-lg text-sm bg-black text-white hover:bg-slate-900"
            >
              Save Trip
            </button>
          </div>
        </div>
      </header>

      {/* Controls row (simple and aligned) */}
      <section className="max-w-6xl mx-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4">
        {/* Left: Inputs */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          {/* Vehicle */}
          <div>
            <label className="text-xs font-medium text-slate-600">Vehicle</label>
            <div className="mt-1">
              {vehicles.length === 0 ? (
                <div className="text-sm text-slate-600">
                  No vehicles found. Add one in{" "}
                  <a href="/vehicles" className="underline text-emerald-700">
                    Vehicle Manager
                  </a>.
                </div>
              ) : (
                <select
                  value={selectedVehicleId || ""}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  {vehicles.map((v) => (
                    <option key={v.vehicleId} value={v.vehicleId}>
                      {v.brand_name} {v.model_name} • {v.plate}
                    </option>
                  ))}
                </select>
              )}
            </div>
            {selectedVehicle && (
              <div className="mt-2 text-xs text-slate-600">
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

          {/* Start / End */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600">Start</label>
              {isLoaded && (
                <Autocomplete
                  onLoad={(ref) => (acStartRef.current = ref)}
                  onPlaceChanged={() =>
                    onAutoComplete(acStartRef, setStartGeo, setStartText)
                  }
                >
                  <input
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    placeholder="Colombo, Sri Lanka"
                    value={startText}
                    onChange={(e) => setStartText(e.target.value)}
                  />
                </Autocomplete>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">Destination</label>
              {isLoaded && (
                <Autocomplete
                  onLoad={(ref) => (acEndRef.current = ref)}
                  onPlaceChanged={() =>
                    onAutoComplete(acEndRef, setEndGeo, setEndText)
                  }
                >
                  <input
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    placeholder="Kandy, Sri Lanka"
                    value={endText}
                    onChange={(e) => setEndText(e.target.value)}
                  />
                </Autocomplete>
              )}
            </div>
            
          </div>

          {/* Stops */}
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-slate-700">Stops</div>
              <button
                onClick={addStop}
                className="px-3 py-1.5 rounded-lg text-sm border border-slate-300 text-white "
              >
                + Add Stop
              </button>
            </div>

            {stops.map((st, index) => (
              <div key={st.id} className="mt-2 flex items-center gap-2">
                <div className="flex-1">
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
                      className="w-full px-3 py-2 rounded-lg border border-slate-300"
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
                  className="px-3 py-2 rounded-lg text-sm bg-rose-600 text-white" style={{backgroundColor: '#EF4444'}}
                  title="Remove stop"
                >
                  Remove
                </button>
              </div>
            ))}

            
          </div>
          <div className="mt-4  flex w-full">
              <button
                onClick={planRoute}
                className="px-4 py-2 w-full rounded-lg bg-emerald-600 text-white font-medium" style={{backgroundColor: '#10B981'}}
              >
                Plan Trip
              </button>
            </div>
        </div>

        {/* Right: Stations panel */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between ">
            <div>
              <div className="font-semibold">Nearby Stations</div>
              <div className="text-xs text-slate-500">
                Green pins are recommended for your car
              </div>
            </div>
          </div>

          {stations.length === 0 ? (
            <div className="text-sm text-slate-600 mt-4">
              Plan a trip to see stations.
            </div>
          ) : (
            <div className="mt-3 grid gap-3 overflow-scroll max-h-60" >
              {stations.map((s) => (
                <TripPlannerStationCard
                  key={s.station_id}
                  station={s}
                  isBest={bestStationIds.has(s.station_id)}
                  onSelect={() => setSelectedStation(s)}
                  onAddStop={() => addStopFromStation(s)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Map */}
      <section className="max-w-6xl mx-auto px-4 pb-10">
        <div
          className={`h-[68vh] rounded-xl overflow-hidden border border-slate-200 bg-white ${
            loading ? "opacity-70" : ""
          }`}
        >
          {isLoaded && (
            <GoogleMap
              key={mapKey}
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

        {/* Route summary */}
        {routeInfo && (
          <div className="mt-4 grid sm:grid-cols-3 gap-3">
            <div className="bg-white border border-slate-200 rounded-xl p-3">
              <div className="text-sm text-slate-600">Distance</div>
              <div className="font-semibold">{routeInfo.distance_km} km</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3">
              <div className="text-sm text-slate-600">Duration</div>
              <div className="font-semibold">{routeInfo.duration_min} min</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3">
              <div className="text-sm text-slate-600">Recommended stops</div>
              <div className="font-semibold">
                {Array.from(bestStationIds).length}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Station Modal */}
      {selectedStation && (
        <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center">
          <div className="bg-white rounded-xl w-[min(500px,92vw)] border border-slate-200 shadow-xl p-5 relative">
            <button
              onClick={() => setSelectedStation(null)}
              className="absolute top-2 right-2 px-3 py-1.5 bg-slate-100 rounded-md"
            >
              Close
            </button>
            <h2 className="text-lg font-semibold">{selectedStation.name}</h2>
            <p className="text-sm text-slate-600 mt-1">
              {selectedStation.address || "No address available"}
            </p>

            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <div className="text-xs text-slate-600">Max Power</div>
                <div className="font-semibold">
                  {selectedStation.max_power_kw || 0} kW
                </div>
              </div>
              {selectedStation.distance_to_route_km != null && (
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <div className="text-xs text-slate-600">Distance to route</div>
                  <div className="font-semibold">
                    {selectedStation.distance_to_route_km} km
                  </div>
                </div>
              )}
              <div className="col-span-2 bg-slate-50 rounded-lg p-3 border border-slate-200">
                <div className="text-xs text-slate-600">Coordinates</div>
                <div className="font-semibold">
                  {selectedStation.lat}, {selectedStation.lon}
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => addStopFromStation(selectedStation)}
                className="flex-1 px-4 py-2 rounded-lg bg-emerald-600 text-white"
              >
                Add as Stop
              </button>
              <button
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps/dir/?api=1&destination=${selectedStation.lat},${selectedStation.lon}`,
                    "_blank"
                  )
                }
                className="flex-1 px-4 py-2 rounded-lg bg-slate-900 text-white"
              >
                Navigate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-5 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg border ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
          onAnimationEnd={() => {}}
        >
          <span className="text-sm">{toast.text}</span>
          <button
            className="ml-3 text-xs underline"
            onClick={() => setToast(null)}
          >
            close
          </button>
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/20">
          <div className="bg-white border border-slate-200 rounded-lg px-6 py-4 shadow-xl">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="mt-2 text-sm text-slate-700 text-center">
              Planning route…
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
