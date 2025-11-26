// src/pages/UserDashboard.jsx
import React from "react";
import { motion } from "framer-motion";

import {
  FiUser,
  FiCalendar,
  FiZap,
  FiCreditCard,
  FiLogOut,
  FiMapPin,
  FiClock
} from "react-icons/fi";

import { MdEvStation } from "react-icons/md";
import { TbBatteryCharging } from "react-icons/tb";
import { LuCar } from "react-icons/lu";   // ✅ FIX: Replace FiCar

const glass =
  "backdrop-blur-xl bg-white/70 border border-emerald-200/60 shadow-[0_8px_35px_rgba(16,185,129,0.12)]";

const UserDashboard = () => {
  // ------- Mock data (replace with API data) -------
  const user = {
    name: "Hi, Sangeeth ",
  };

  const monthly = {
    spentLKR: 18450.75,
    kwh: 212.4,
  };

  const upcomingBooking = {
    station: "Ampora SuperCharge – Borella",
    address: "No.45 Kandy Rd, Kiribathgoda",
    date: "2025-11-22",
    time: "11:00 AM",
    charger: "CCS • 100 kW",
    status: "Confirmed",
    price: "LKR 3,150",
  };

  const vehicle = {
    brand: "Nissan",
    model: "Leaf",
    variant: "40 kWh",
    plate: "WP-CAD-4123",
    rangeKm: 240,
    connector: "CHAdeMO",
  };

  // ------- Quick actions -------
  const quickActions = [
    { title: "User Details", icon: <FiUser />, to: "/profile" },
    { title: "Vehicle Details", icon: <LuCar />, to: "/vehicles" }, // ✅ FIXED
    { title: "Bookings", icon: <FiCalendar />, to: "/bookings" },
    { title: "View Plans & Subscription", icon: <FiCreditCard />, to: "/payments" },
    { title: "Charging History", icon: <FiZap />, to: "/history" },
    { title: "Logout", icon: <FiLogOut />, to: "/logout" },
  ];

  const pill =
    "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold";

  return (
    <div className="w-screen min-h-screen bg-gradient-to-b from-emerald-50 via-teal-50 to-white text-gray-900">
      {/* Header */}
      <div className="mx-auto w-11/12 max-w-7xl py-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-emerald-700">
              {user.name}
            </h1>
            <p className="text-emerald-900/70">
              Your EV journey at a glance—actions, usage, bookings & vehicle.
            </p>
          </div>
          <div className={`${glass} rounded-2xl px-4 py-2`}>
            <span className="text-sm text-emerald-900/80">
              Plan a trip faster from here →
            </span>
            <a
              href="/trip"
              className="ml-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1 rounded-lg"
            >
             <span className="text-white">Open Trip Planner</span> 
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto w-11/12 max-w-7xl pb-12 space-y-8">
        {/* Row 1: Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4"
        >
          {quickActions.map((a, idx) => (
            <a
              key={idx}
              href={a.to}
              className={`${glass} rounded-2xl p-4 hover:shadow-xl transition group`}
            >
              <div className="flex items-center gap-3">
                <div className="grid place-items-center w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 text-lg group-hover:scale-105 transition">
                  {a.icon}
                </div>
                <div className="font-semibold text-sm text-emerald-900">
                  {a.title}
                </div>
              </div>
            </a>
          ))}
        </motion.div>

        {/* Row 2: Monthly Usage + Upcoming Booking */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly usage cards (span 2 on large) */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:col-span-2"
          >
            <div className={`${glass} rounded-2xl p-6`}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-emerald-900/80">Spent this month</h3>
                <FiCreditCard className="text-emerald-600" />
              </div>
              <p className="mt-2 text-3xl font-extrabold text-emerald-700">
                LKR {monthly.spentLKR.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-emerald-900/70 mt-1">Billing cycle: 1 → 30</p>
            </div>

            <div className={`${glass} rounded-2xl p-6`}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-emerald-900/80">Energy used</h3>
                <TbBatteryCharging className="text-emerald-600" />
              </div>
              <p className="mt-2 text-3xl font-extrabold text-emerald-700">
                {monthly.kwh.toFixed(1)} kWh
              </p>
              <p className="text-xs text-emerald-900/70 mt-1">Estimated grid + fast DC mix</p>
            </div>
          </motion.div>

          {/* Upcoming booking */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${glass} rounded-2xl p-6`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-emerald-900">Upcoming booking</h3>
              <span className={`${pill} bg-emerald-100 text-emerald-700`}>
                {upcomingBooking.status}
              </span>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2">
                <MdEvStation className="text-emerald-600" />
                <p className="font-semibold text-emerald-800">
                  {upcomingBooking.station}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-emerald-900/80">
                <FiMapPin /> {upcomingBooking.address}
              </div>
              <div className="flex items-center gap-4 text-sm text-emerald-900/80">
                <span className="inline-flex items-center gap-2">
                  <FiClock /> {upcomingBooking.date} • {upcomingBooking.time}
                </span>
                <span>• {upcomingBooking.charger}</span>
              </div>
              <div className="pt-2 text-sm">
                Est. Cost: <span className="font-semibold">{upcomingBooking.price}</span>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <a
                href="/bookings"
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
              >
                <span className="text-white">View Details</span>
              </a>
              <button className="px-4 py-2 rounded-lg border border-emerald-300 text-white text-sm hover:bg-emerald-50">
                Reschedule
              </button>
            </div>
          </motion.div>
        </div>

        {/* Row 3: Selected Vehicle */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${glass} rounded-2xl p-6`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="font-semibold text-emerald-900">Selected vehicle</h3>
              <p className="text-emerald-900/70 text-sm">
                From your vehicle list •{" "}
                <a href="/vehicles" className="underline decoration-emerald-400">
                  change vehicle
                </a>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <span className={`${pill} bg-emerald-100 text-emerald-700`}>
                {vehicle.brand} {vehicle.model} • {vehicle.variant}
              </span>
              <span className={`${pill} bg-teal-100 text-teal-700`}>
                Range ~ {vehicle.rangeKm} km
              </span>
              <span className={`${pill} bg-emerald-50 text-emerald-700 border border-emerald-200`}>
                Connector: {vehicle.connector}
              </span>
              <span className={`${pill} bg-gray-100 text-gray-700`}>
                Plate: {vehicle.plate}
              </span>
            </div>
          </div>

          {/* cute little line */}
          <div className="mt-5 h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent" />

          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="/trip"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold shadow hover:shadow-lg"
            >
              <span className="text-white">Plan with this vehicle</span>
            </a>
            <button className="px-4 py-2 rounded-lg border border-emerald-300 text-white text-sm hover:bg-emerald-50">
              Manage vehicles
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserDashboard;

