import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CalendarIcon,
  BoltIcon,
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";

const API_BASE = "https://ampora.dev";

export default function Bookings() {

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const operatorId = localStorage.getItem("userId");

  useEffect(() => {

    async function loadBookings() {

      try {

        const res = await fetch(
          `${API_BASE}/api/bookings/operator/${operatorId}`
        );

        const data = await res.json();

        setBookings(Array.isArray(data) ? data : []);

      } catch (err) {
        console.error("Failed to load bookings", err);
      } finally {
        setLoading(false);
      }

    }

    loadBookings();

  }, [operatorId]);

  return (
    <div className="min-h-screen pt-24 px-6 pb-24 bg-gradient-to-br from-white via-sky-50 to-emerald-50">

      <div className="w-full mx-auto mb-6">
        <h1 className="text-2xl font-semibold text-slate-800 flex items-center gap-2">
          <CalendarIcon className="w-7 h-7 text-emerald-700" />
          Station Bookings
        </h1>
      </div>

      {loading && (
        <p className="text-center text-gray-500">Loading bookings...</p>
      )}

      {!loading && bookings.length === 0 && (
        <p className="text-center text-gray-500">No bookings found.</p>
      )}

      <div className="max-w-6xl mx-auto space-y-6">
        {bookings.map((booking) => (
          <BookingCard key={booking.bookingId} booking={booking} />
        ))}
      </div>

    </div>
  );
}


function BookingCard({ booking }) {

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border rounded-xl shadow-lg p-6 space-y-5"
    >

      <div className="flex justify-between items-start">

        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Booking ID: {booking.bookingId}
          </h2>

          <p className="text-sm text-slate-500">
            {booking.date} • {booking.startTime} - {booking.endTime}
          </p>
        </div>

        <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-700">
          {booking.status}
        </span>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="border rounded-lg p-4">
          <h3 className="font-medium text-slate-700 mb-3 flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            User
          </h3>

          <p className="text-sm">
            User ID: {booking.userId}
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-medium text-slate-700 mb-3 flex items-center gap-2">
            <MapPinIcon className="w-5 h-5" />
            Station
          </h3>

          <p className="text-sm">{booking.stationName}</p>
          <p className="text-sm">{booking.address}</p>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-medium text-slate-700 mb-3 flex items-center gap-2">
            <BoltIcon className="w-5 h-5" />
            Charging
          </h3>

          <p className="text-sm">Type: {booking.chargerType}</p>
          <p className="text-sm">Fee: LKR {booking.amount}</p>
        </div>

      </div>

    </motion.div>
  );
}
