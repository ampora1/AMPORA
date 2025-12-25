// src/pages/StationFinder.jsx
import React, { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import StationCard from "../components/Station/StationCard";

const API_BASE = "http://127.0.0.1:8083";

const StationFinder = () => {
  const [search, setSearch] = useState("");
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load Google Maps
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const mapContainerStyle = {
    width: "100%",
    height: "100%",
  };

  const center = {
    lat: 6.9271,
    lng: 79.8612,
  };

  // 🔥 FETCH STATIONS FROM BACKEND
  useEffect(() => {
    async function loadStations() {
      try {
        const res = await fetch(`${API_BASE}/api/stations`);
        const data = await res.json();

        // Backend returns ARRAY, not { success:true }
        const stationsArray = Array.isArray(data) ? data : [];

        const formatted = stationsArray.map((s) => ({
          id: s.stationId,
          name: s.name,
          address: s.address || "No Address",
          lat: s.latitude,
          lng: s.longitude,
          available: s.available_ports ?? 0,
          total: s.total_ports ?? 0,
          renewable: s.renewable_percentage ?? 0,
          queue: s.queue_length ?? 0,
        }));

        setStations(formatted);
      } catch (err) {
        console.error("Error loading stations:", err);
      } finally {
        setLoading(false);
      }
    }

    loadStations();
  }, []);

  // 🔍 Search filter
  const filteredStations = stations.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-screen overflow-x-hidden bg-[#EDFFFF] flex flex-col items-center pb-10">

      {/* Banner */}
      <div className="w-full h-[30vh] bg-black from-emerald-300 to-emerald-500 rounded-b-[50px] flex justify-center items-center shadow-md">
        <h1 className="text-5xl font-bold text-white drop-shadow-lg text-center">
          Find Charging Stations ⚡
        </h1>
      </div>

      {/* Search */}
      <div className="w-10/12 mt-[-40px] bg-white p-5 rounded-2xl shadow-xl flex items-center gap-4">
        <FiSearch size={24} className="text-emerald-500" />
        <input
          type="text"
          placeholder="Search station name, city, or location..."
          className="w-full p-3 rounded-xl border border-emerald-300 outline-none focus:ring-2 text-black focus:ring-emerald-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Layout */}
      <div className="w-10/12 mt-10 flex flex-col lg:flex-row gap-6">

        {/* MAP */}
        <div className="sm:w-12/12 md:w-12/12 lg:w-7/12 h-[75vh] bg-white rounded-3xl shadow-xl overflow-hidden">
          {!isLoaded ? (
            <p className="text-center mt-10 text-gray-500">Loading Map...</p>
          ) : loading ? (
            <p className="text-center mt-10 text-gray-500">Loading stations...</p>
          ) : (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              zoom={12}
              center={center}
            >
              {filteredStations.map((station) => (
                <Marker
                  key={station.id}
                  position={{ lat: station.lat, lng: station.lng }}
                  onClick={() => setSelectedStation(station)}
                />
              ))}
            </GoogleMap>
          )}
        </div>

        {/* STATION LIST */}
        <div className="sm:w-12/12 md:w-12/12 lg:w-5/12 h-[75vh] overflow-y-scroll bg-white rounded-3xl shadow-xl p-5">
          <h2 className="text-2xl font-bold text-emerald-600 mb-4">
            Nearby Stations
          </h2>

          {loading && <p className="text-gray-500">Loading...</p>}

          {filteredStations.length === 0 && !loading && (
            <p className="text-gray-500">No stations found.</p>
          )}

          <div className="flex flex-col gap-5">
            {filteredStations.map((station) => (
              <div
                key={station.id}
                onClick={() => setSelectedStation(station)}
              >
                <StationCard station={station} />
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* POPUP CARD */}
      {selectedStation && (
        <div className="fixed bottom-10 w-10/12 lg:w-4/12 bg-white rounded-3xl shadow-2xl p-5 animate-slideUp border border-emerald-200">
          <StationCard station={selectedStation} />
          <button
            onClick={() => setSelectedStation(null)}
            className="mt-4 w-full py-2 bg-emerald-600 text-white rounded-xl shadow hover:bg-emerald-700"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default StationFinder;
