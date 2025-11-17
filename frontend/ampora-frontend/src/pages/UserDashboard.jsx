import React from "react";
import { FaCar, FaMapMarkedAlt, FaBatteryHalf, FaChargingStation } from "react-icons/fa";
import { MdPayments } from "react-icons/md";

const UserDashboard = () => {
  return (
    <div className="w-screen min-h-screen bg-[#EDFFFF] flex flex-col items-center py-10">

      {/* HEADER */}
      <div className="w-11/12 bg-emerald-500 rounded-3xl h-[180px] text-white p-8 flex justify-between items-center shadow-lg">
        <div>
          <h1 className="text-4xl font-bold">Welcome Back, Sangeeth 👋</h1>
          <p className="text-lg opacity-90 mt-2">Manage your EV journey with ease</p>
        </div>

        <div className="bg-white bg-opacity-20 px-6 py-3 rounded-2xl backdrop-blur-md">
          <p className="text-lg font-medium">Current Battery</p>
          <p className="text-3xl font-bold">78%</p>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="w-11/12 grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10">
        <div className="bg-white p-6 rounded-3xl shadow-xl hover:scale-105 transition-all cursor-pointer">
          <FaMapMarkedAlt size={40} className="text-emerald-500" />
          <h3 className="text-xl font-bold mt-4">Plan Your Trip</h3>
          <p className="text-gray-600 mt-2">Get optimized routes & charging stops</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-xl hover:scale-105 transition-all cursor-pointer">
          <FaChargingStation size={40} className="text-emerald-500" />
          <h3 className="text-xl font-bold mt-4">Find Stations</h3>
          <p className="text-gray-600 mt-2">Search nearby charging stations</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-xl hover:scale-105 transition-all cursor-pointer">
          <MdPayments size={40} className="text-emerald-500" />
          <h3 className="text-xl font-bold mt-4">Payments</h3>
          <p className="text-gray-600 mt-2">View plans & manage subscription</p>
        </div>
      </div>

      {/* MAIN CONTENT: 2 COLUMNS */}
      <div className="w-11/12 grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10">

        {/* LEFT COLUMN */}
        <div className="col-span-2 flex flex-col gap-6">

          {/* ACTIVE BOOKING */}
          <div className="bg-white p-6 rounded-3xl shadow-xl">
            <h2 className="text-2xl font-bold text-emerald-600">Active Booking</h2>
            <div className="mt-4">
              <p className="font-semibold text-xl">GreenCharge Downtown</p>
              <p className="text-gray-600">Slot: 2:30 PM – 3:00 PM</p>
              <div className="w-full bg-gray-200 h-2 rounded-lg mt-4">
                <div className="w-1/2 bg-emerald-500 h-2 rounded-lg"></div>
              </div>
              <button className="mt-5 bg-emerald-500 text-white px-4 py-2 rounded-xl hover:bg-emerald-600">
                View Booking
              </button>
            </div>
          </div>

          {/* TRIP HISTORY */}
          <div className="bg-white p-6 rounded-3xl shadow-xl">
            <h2 className="text-2xl font-bold text-emerald-600">Charging History</h2>
            <div className="mt-4 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between border-b pb-3">
                  <div>
                    <p className="font-bold">Ampora Station {i}</p>
                    <p className="text-gray-500 text-sm">Colombo</p>
                  </div>
                  <p className="text-emerald-600 font-bold">18.2 kWh</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-6">

          {/* VEHICLE INFO */}
          <div className="bg-white p-6 rounded-3xl shadow-xl">
            <h2 className="text-2xl font-bold text-emerald-600 mb-4">My Vehicle</h2>
            <div className="flex items-center gap-4">
              <FaCar size={50} className="text-emerald-500" />
              <div>
                <p className="text-xl font-semibold">Tesla Model 3</p>
                <p className="text-gray-600">Battery: 72 kWh</p>
                <p className="text-gray-600">Range: 420 km</p>
              </div>
            </div>
          </div>

          {/* UPCOMING TRIPS */}
          <div className="bg-white p-6 rounded-3xl shadow-xl">
            <h2 className="text-2xl font-bold text-emerald-600 mb-4">Upcoming Trips</h2>

            {[1, 2].map((i) => (
              <div
                key={i}
                className="border rounded-xl p-4 mb-3 hover:border-emerald-400 transition"
              >
                <p className="font-semibold">Trip #{i}</p>
                <p className="text-gray-600 text-sm">Colombo → Kandy</p>
                <p className="text-gray-600 text-sm">Tomorrow • 9:00 AM</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
