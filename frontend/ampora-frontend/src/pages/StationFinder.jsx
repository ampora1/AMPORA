// src/pages/StationFinder.jsx
import React, { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import StationCard from "../components/Station/StationCard";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const API_BASE = "http://127.0.0.1:8083";

const StationFinder = () => {
  const [search, setSearch] = useState("");
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Booking data
  const [bookingDate, setBookingDate] = useState(null);
  const [bookingTime, setBookingTime] = useState("");
  const [duration, setDuration] = useState(1);
  const [availability, setAvailability] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  const userId = localStorage.getItem("userId");

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const mapContainerStyle = { width: "100%", height: "100%" };
  const center = { lat: 6.9271, lng: 79.8612 };

 
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
          chargerId: s.chargers && s.chargers.length > 0 ? s.chargers[0].chargerID : null,
          maxPower: s.powerKw || 0,
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

 
  const filteredStations = stations.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.address.toLowerCase().includes(search.toLowerCase())
  );


  async function checkAvailability() {
    if (!bookingDate || !bookingTime || !duration) {
      alert("Select date, time, and duration first.");
      return;
    }

    const dateStr = bookingDate.toISOString().split("T")[0];
    const [hh, mm] = bookingTime.split(":");

    const startTime = `${hh}:${mm}`;
    const endHour = Number(hh) + Number(duration);

    if (endHour >= 24) {
      alert("End time cannot exceed 23:59");
      return;
    }

    const endTime = `${String(endHour).padStart(2, "0")}:${mm}`;

    setBookingLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/bookings/availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chargerId: selectedStation.chargerId,
          date: dateStr,
          startTime,
          endTime,
        }),
      });

      const data = await res.json();
      setAvailability(data.available);
    } catch (err) {
      console.error(err);
      setAvailability(null);
    } finally {
      setBookingLoading(false);
    }
  }

  
  async function createBooking() {
    if (availability !== true) {
      alert("Time slot not available.");
      return;
    }

    const dateStr = bookingDate.toISOString().split("T")[0];
    const [hh, mm] = bookingTime.split(":");

    const start = `${dateStr}T${hh}:${mm}:00`;
    const end = `${dateStr}T${String(Number(hh) + duration).padStart(2, "0")}:${mm}:00`;

    const payload = {
      userId,
      chargerId: selectedStation.chargerId,
      startTime: start,
      endTime: end,
      date: dateStr,
      bookingStatus: "PENDING",
    };
    console.log("Booking payload:", payload);

    setBookingLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (json.bookingId) {
        alert("Booking successful!");
        setSelectedStation(null);
      } else {
        alert("Booking failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Booking error.");
    } finally {
      setBookingLoading(false);
    }
  }


  return (
    <div className="w-screen overflow-x-hidden bg-[#EDFFFF] flex flex-col items-center pb-10">
      {/* Banner */}
      <div className="w-full h-[30vh] bg-black rounded-b-[50px] flex justify-center items-center shadow-md">
        <h1 className="text-5xl font-bold text-white text-center">
          Find Charging Stations ⚡
        </h1>
      </div>

      {/* Search */}
      <div className="w-10/12 mt-[-40px] bg-white p-5 rounded-2xl shadow-xl flex items-center gap-4">
        <FiSearch size={24} className="text-emerald-500" />
        <input
          type="text"
          placeholder="Search station name, city, or location..."
          className="w-full p-3 rounded-xl border border-emerald-300 text-black"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Layout */}
      <div className="w-10/12 mt-10 flex flex-col lg:flex-row gap-6">
        {/* MAP */}
        <div className="lg:w-7/12 h-[75vh] bg-white rounded-3xl shadow-xl overflow-hidden">
          {!isLoaded || loading ? (
            <p className="text-center mt-10 text-gray-500">Loading map...</p>
          ) : (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              zoom={12}
              center={center}
            >
              {filteredStations.map((st) => (
                <Marker
                  key={st.id}
                  position={{ lat: st.lat, lng: st.lng }}
                  onClick={() => setSelectedStation(st)}
                />
              ))}
            </GoogleMap>
          )}
        </div>

        {/* LIST */}
        <div className="lg:w-5/12 h-[75vh] overflow-y-scroll bg-white rounded-3xl p-5 shadow-xl">
          <h2 className="text-2xl font-bold text-emerald-600 mb-4">
            Nearby Stations
          </h2>

          <div className="flex flex-col gap-5">
            {filteredStations.map((st) => (
              <div key={st.id} onClick={() => setSelectedStation(st)}>
                <StationCard station={st} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BOOKING POPUP */}
      {selectedStation && (
        <div className="absolute top-20 w-10/12 lg:w-4/12 bg-white rounded-3xl shadow-xl p-5 border border-emerald-200">
          <StationCard station={selectedStation} /> 

          <h3 className="text-xl  font-bold text-emerald-700 mt-4">
            Book a Charging Slot
          </h3>

          {/* DATE */}
          <label className="block mt-3 font-semibold text-sm text-emerald-600">
            Select Date
          </label>
          <DatePicker
            selected={bookingDate}
            onChange={(d) => setBookingDate(d)}
            dateFormat="yyyy-MM-dd"
            minDate={new Date()}
            placeholderText="Select a date"
            className="w-full p-2 border rounded-lg text-black"
          />

          {/* TIME */}
          <label className="block mt-3 font-semibold text-sm text-emerald-600">
            Select Start Time
          </label>
          <input
            type="time"
            value={bookingTime}
            onChange={(e) => setBookingTime(e.target.value)}
            placeholder="Set Time "
            className="w-full p-2 border rounded-lg border-black text-black"
          />

          {/* Duration */}
          <label className="block mt-3 font-semibold text-sm text-emerald-600">
            Duration (Hours)
          </label>
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full p-2 border rounded-lg border-black text-black"
          >
            <option value={1}>1 hour</option>
            <option value={2}>2 hours</option>
            <option value={3}>3 hours</option>
          </select>

          {/* Availability */}
          {availability !== null && (
            <p
              className={`mt-3 text-sm font-bold ${
                availability ? "text-green-600" : "text-red-600"
              }`}
            >
              {availability
                ? "Slot is available ✔"
                : "Slot unavailable ✖"}
            </p>
          )}

          {/* Buttons */}
          <div className="flex gap-3 mt-5">
            <button
              onClick={checkAvailability}
              className="flex-1 bg-emerald-500 text-white py-2 rounded-lg"
            >
              Check Availability
            </button>

            <button
              onClick={createBooking}
              className="flex-1 bg-black text-white py-2 rounded-lg"
            >
              Book Now
            </button>
          </div>

          <button
            className="mt-4 w-full bg-gray-200 py-2 rounded-lg"
            onClick={() => setSelectedStation(null)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default StationFinder;
