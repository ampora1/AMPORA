/* global google */
import React, { useState, useEffect, useRef } from "react";
import { FiSearch } from "react-icons/fi";
import {
  GoogleMap,
  Marker,
  useLoadScript,
  Autocomplete,
} from "@react-google-maps/api";
import StationCard from "../components/Station/StationCard";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://13.211.243.202:8083";
const RADIUS_KM = 10;

/* ================= DISTANCE ================= */
function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function StationFinder() {
  const [searchPlace, setSearchPlace] = useState("");
  const [stations, setStations] = useState([]);
  const [filteredStations, setFilteredStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedCharger, setSelectedCharger] = useState(null);
  const [showPayment, setShowPayment] = useState(false);

  const [loading, setLoading] = useState(true);

  const searchRef = useRef(null);

  /* Booking */
  const [bookingDate, setBookingDate] = useState(null);
  const [bookingTime, setBookingTime] = useState("");
  const [duration, setDuration] = useState(1);
  const [availability, setAvailability] = useState(null);
  // 🔎 Filters
  const [chargerTypeFilter, setChargerTypeFilter] = useState("ALL");
  const [minPowerFilter, setMinPowerFilter] = useState(0);

  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyDgg91f6DBk5-6ugJ2i684WkRuyq5w5rcM",
    libraries: ["places"],
  });

  const mapContainerStyle = { width: "100%", height: "100%" };
  const [mapCenter, setMapCenter] = useState({
    lat: 6.9271,
    lng: 79.8612,
  });
  useEffect(() => {
    const filtered = applyFilters(stations);
    setFilteredStations(filtered);
  }, [chargerTypeFilter, minPowerFilter, stations]);

  useEffect(() => {
    async function loadStations() {
      try {
        const res = await fetch(`${API_BASE}/api/stations`);
        const data = await res.json();


        const formatted = (Array.isArray(data) ? data : []).map((s) => ({
          id: s.stationId,
          name: s.name,
          address: s.address || "No Address",
          lat: s.latitude,
          lng: s.longitude,


          chargers: (s.chargers || []).map(c => ({
            id: c.chargerID,
            type: c.type,
            powerKw: c.powerKw,
            status: c.status
          }))
        }));
        console.log(
          "CHARGER TYPES:",
          formatted.flatMap(s => s.chargers.map(c => c.type))
        );
        setStations(formatted);
        setFilteredStations(formatted);
      } finally {
        setLoading(false);
      }
    }
    loadStations();
  }, []);

  function filterByDistance(lat, lng) {
    setFilteredStations(
      stations.filter(
        (st) => distanceKm(lat, lng, st.lat, st.lng) <= RADIUS_KM
      )
    );
  }

  function handlePlaceSelect() {
    const place = searchRef.current.getPlace();
    if (!place || !place.geometry) return;

    const location = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };

    setSearchPlace(place.formatted_address);
    setMapCenter(location);
    filterByDistance(location.lat, location.lng);
  }


  async function checkAvailability() {
    if (!bookingDate || !bookingTime || !duration || !selectedCharger) {
      alert("Select charger, date and time");
      return;
    }

    const dateStr = bookingDate.toISOString().split("T")[0];
    const [hh, mm] = bookingTime.split(":");
    const endHour = Number(hh) + duration;

    const res = await fetch(`${API_BASE}/api/bookings/availability`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chargerId: selectedCharger.id,
        date: dateStr,
        startTime: `${hh}:${mm}`,
        endTime: `${endHour}:${mm}`,
      }),
    });

    const data = await res.json();
    setAvailability(data.available);
  }
  function applyFilters(baseStations) {
    return baseStations.filter((station) =>
      station.chargers.some((charger) => {
        const typeMatch =
          chargerTypeFilter === "ALL" ||
          charger.type === chargerTypeFilter;

        const powerMatch =
          charger.powerKw >= minPowerFilter;

        return typeMatch && powerMatch;
      })
    );
  }



  function filterByDistance(lat, lng) {
    const nearby = stations.filter(
      (st) => distanceKm(lat, lng, st.lat, st.lng) <= RADIUS_KM
    );

    setFilteredStations(applyFilters(nearby));
  }


  // async function confirmPayment(bookingId) {
  //   await fetch(`${API_BASE}/api/payments/confirm/${bookingId}`, {
  //     method: "POST",
  //   });
  // }
  // async function createBooking() {
  //   if (!availability) return;

  //   const dateStr = bookingDate.toISOString().split("T")[0];
  //   const [hh, mm] = bookingTime.split(":");

  //   await fetch(`${API_BASE}/api/bookings`, {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({
  //       userId,
  //       chargerId: selectedCharger.id,
  //       date: dateStr,
  //       startTime: `${dateStr}T${hh}:${mm}:00`,
  //       endTime: `${dateStr}T${Number(hh) + duration}:${mm}:00`,
  //       amount: duration * 800, // Example: 500 currency units per hour
  //       bookingStatus: "PENDING",
  //     }),
  //   });

  //   setSelectedStation(null);
  // }

  if (!isLoaded || loading) return <p className="p-10">Loading…</p>;

  return (
    <div className="w-screen bg-teal-100 pb-20">


      <div className="relative lg:h-[34vh] h-[30vh] mt-5 lg:mt-0 rounded-b-[70px] overflow-hidden
                      bg-gradient-to-tr from-teal-900 via-emerald-800 to-teal-700">
        <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 120">
          <path
            fill="rgba(255,255,255,0.15)"
            d="M0,64L60,58.7C120,53,240,43,360,53.3C480,64,600,96,720,101.3C840,107,960,85,1080,69.3C1200,53,1320,43,1380,37.3L1440,32V120H0Z"
          />
        </svg>

        <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
          <h1 className="lg:text-5xl text-3xl md:text-6xl font-extrabold text-white">
            Find <span className="text-emerald-300">EV</span> Charging Stations
          </h1>
          <p className="mt-3 text-emerald-100 text-lg">
            Fast • Smart • Sustainable
          </p>
        </div>
      </div>


      <div className="max-w-5xl mx-auto -mt-12 px-4">
        <div className="bg-white/95 backdrop-blur-xl p-5 rounded-2xl
                        shadow-[0_20px_50px_rgba(0,0,0,0.15)]
                        flex gap-4 items-center">
          <FiSearch size={22} className="text-emerald-500" />
          <Autocomplete
            onLoad={(ref) => (searchRef.current = ref)}
            onPlaceChanged={handlePlaceSelect}
          >
            <input
              className="w-full p-3 rounded-xl outline-none"
              placeholder="Search your area…"
              value={searchPlace}
              onChange={(e) => setSearchPlace(e.target.value)}
            />
          </Autocomplete>
        </div>
      </div>
      {/* ================= FILTER BAR ================= */}
      <div className="sticky top-10 z-20 mt-6">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg
                    px-6 py-4 flex flex-col md:flex-row
                    md:items-center md:justify-between gap-4">

            {/* Charger Type Chips */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Charger Type</p>
              <div className="flex gap-2 flex-wrap">
                {["ALL", "CCS2", "CHAdeMO", "Type2"].map(type => (
                  <button
                    key={type}
                    onClick={() => setChargerTypeFilter(type)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium
                transition-all
                ${chargerTypeFilter === type
                        ? "bg-emerald-500 text-white shadow"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Power Slider */}
            <div className="min-w-[220px]">
              <p className="text-xs text-gray-500 mb-1">
                Minimum Power: <span className="font-semibold text-emerald-600">
                  {minPowerFilter} kW+
                </span>
              </p>
              <input
                type="range"
                min={0}
                max={100}
                step={10}
                value={minPowerFilter}
                onChange={(e) => setMinPowerFilter(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

          </div>
        </div>
      </div>



      <div className="max-w-4xl mx-auto mt-10 px-6 text-center">
        <p className="text-lg text-gray-700 leading-relaxed">
          Discover reliable <span className="font-semibold text-emerald-600">EV charging stations</span>
          near you with ease.
          Search any location to instantly view nearby stations, compare availability,
          and book your charging slot — all in one place.
        </p>

        <p className="mt-3 text-sm text-gray-500">
          Smart routing • Real-time availability • Hassle-free booking
        </p>
      </div>


      <div className="max-w-6xl mx-auto mt-14 px-4">
        <div className="h-[65vh] bg-white rounded-[32px]
                        shadow-[0_30px_80px_rgba(0,0,0,0.25)]
                        overflow-hidden">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={mapCenter}
            zoom={13}
          >
            {filteredStations.map((st) => (
              <Marker
                key={st.id}
                position={{ lat: st.lat, lng: st.lng }}
                onClick={() => setSelectedStation(st)}
              />
            ))}
          </GoogleMap>
        </div>
      </div>


      <div className="max-w-6xl mx-auto mt-10 px-4">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-emerald-600">
            Stations within {RADIUS_KM} km
          </h2>
          <span className="text-sm bg-emerald-100 px-3 py-1 rounded-full">
            ⚡ {filteredStations.length}
          </span>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-6
                        snap-x snap-mandatory">
          {filteredStations.map((st) => (
            <div
              key={st.id}
              className="min-w-[320px] snap-start"
              onClick={() => setSelectedStation(st)}
            >
              <StationCard
                station={st}
                onSelectCharger={setSelectedCharger}
              />
            </div>
          ))}
        </div>
      </div>
      {showPayment && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-3xl w-full max-w-sm">

            <h3 className="text-xl font-bold text-emerald-700">
              Payment
            </h3>

            <p className="mt-3 text-gray-600">
              Booking Fee: <strong>LKR 300</strong>
            </p>

            <p className="text-sm text-gray-500 mt-1">
              This fee confirms your charging slot.
            </p>

            <button
              onClick={async () => {

                await createBooking();
                await confirmPayment();
                setShowPayment(false);
              }}
              className="mt-6 w-full bg-emerald-500 text-white py-3 rounded-xl font-semibold"
            >
              Pay & Confirm
            </button>

            <button
              onClick={() => setShowPayment(false)}
              className="mt-3 w-full bg-gray-200 py-2 rounded-xl"
            >
              Cancel
            </button>
          </div>
        </div>
      )}


      {selectedStation && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm
                        flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md">
            <StationCard
              station={selectedStation}
              selectedCharger={selectedCharger}
              onSelectCharger={setSelectedCharger}
            />

            <h3 className="text-xl font-bold text-emerald-700 mt-4">
              Book Charging Slot
            </h3>

            <DatePicker
              selected={bookingDate}
              onChange={setBookingDate}
              minDate={new Date()}
              className="w-full p-2 border rounded mt-2"
              placeholderText="Select Date"
            />

            <input
              type="time"
              className="w-full p-2 border rounded mt-2"
              value={bookingTime}
              onChange={(e) => setBookingTime(e.target.value)}
              placeholder="Select Time"
            />

            <select
              className="w-full p-2 border rounded mt-2"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            >
              <option >Select Time slot</option>
              <option value={1}>1 hour</option>
              <option value={2}>2 hours</option>
              <option value={3}>3 hours</option>
            </select>

            {availability !== null && (
              <p
                className={`mt-3 font-bold ${availability ? "text-green-600" : "text-red-600"
                  }`}
              >
                {availability ? "Slot available ✔" : "Slot unavailable ✖"}
              </p>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={checkAvailability}
                className="flex-1 bg-emerald-500 text-white py-2 rounded-xl"
              >
                Check
              </button>
              <button
                disabled={!selectedCharger || availability !== true}
                onClick={async () => {
                  if (!bookingDate || !bookingTime || !selectedCharger) {
                    alert("Please select date, time, and charger");
                    return;
                  }
                  const [hh, mm] = bookingTime.split(":").map(Number);

                  const start = new Date();
                  start.setHours(hh, mm, 0, 0);

                  const end = new Date(start);
                  end.setHours(end.getHours() + duration);

                  const endTime = end.toTimeString().slice(0, 5);
                  try {
                    console.log("Creating pending booking...");

                    const res = await fetch(
                      "http://localhost:8083/api/payment/pending",
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          userId,
                          chargerId: selectedCharger.id,
                          date: bookingDate.toISOString().split("T")[0],
                          startTime: bookingTime,
                          endTime: endTime,
                          duration: duration,
                          amount: 300,
                        }),
                      }
                    );

                    if (!res.ok) {
                      const errText = await res.text();
                      console.error("Pending booking failed:", errText);
                      alert("Booking creation failed");
                      return;
                    }

                    const data = await res.json();
                    console.log("Pending booking response:", data);

                    if (!data.bookingId) {
                      alert("Booking ID not returned");
                      return;
                    }

                    navigate("/payments", {
                      state: {
                        bookingId: data.bookingId,
                        bill: 300,
                      },
                    });

                  } catch (err) {
                    console.error("Pending booking error:", err);
                    alert("Something went wrong");
                  }
                }}

                className="flex-1 bg-emerald-500 text-white py-2 rounded-xl"
              >
                Proceed to Payment
              </button>
            </div>

            <button
              className="mt-4 w-full bg-gray-200 py-2 rounded-xl"
              onClick={() => setSelectedStation(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
