import React from "react";
import { FiMapPin, FiClock } from "react-icons/fi";
import { MdEvStation } from "react-icons/md";
import { FaCheckCircle, FaTimesCircle, FaHourglassHalf } from "react-icons/fa";

const BookingsPage = () => {
  const bookings = [
    {
      id: 1,
      station: "GreenCharge Downtown",
      address: "123 Main St, Colombo",
      date: "2025-11-20",
      time: "4:30 PM",
      charger: "CHAdeMO • 50kW",
      status: "Confirmed",
      price: "$12.50",
    },
    {
      id: 2,
      station: "Ampora SuperCharge",
      address: "No. 45 Kandy Rd, Kiribathgoda",
      date: "2025-11-22",
      time: "11:00 AM",
      charger: "CCS • 100kW",
      status: "Pending",
      price: "$8.20",
    },
    {
      id: 3,
      station: "EcoCharge Hub",
      address: "Galle Road, Panadura",
      date: "2025-10-05",
      time: "6:00 PM",
      charger: "Type 2 • 22kW",
      status: "Cancelled",
      price: "$4.90",
    },
  ];

  const statusColor = {
    Confirmed: "text-emerald-600",
    Pending: "text-yellow-600",
    Cancelled: "text-red-600",
  };

  const statusIcon = {
    Confirmed: <FaCheckCircle />,
    Pending: <FaHourglassHalf />,
    Cancelled: <FaTimesCircle />,
  };

  return (
    <div className="w-screen min-h-screen bg-[#EDFFFF] flex flex-col items-center p-6">
      
      {/* PAGE TITLE */}
      <h1 className="text-4xl font-bold text-emerald-600 mb-4 mt-5">My Bookings</h1>

      {/* BOOKINGS LIST */}
      <div className="w-10/12 grid grid-cols-1 lg:grid-cols-2 gap-6 mt-3">
        {bookings.map((b) => (
          <div
            key={b.id}
            className="bg-white rounded-3xl shadow-lg p-6 border border-emerald-200 hover:shadow-2xl transition-all"
          >
            {/* HEADER */}
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold text-black">
                  {b.station}
                </h2>
                <div className="flex items-center text-gray-500 mt-1">
                  <FiMapPin className="text-emerald-600 mr-1" />
                  {b.address}
                </div>
              </div>

              {/* STATUS */}
              <div
                className={`flex items-center gap-2 font-semibold ${statusColor[b.status]}`}
              >
                {statusIcon[b.status]}
                {b.status}
              </div>
            </div>

            {/* DETAILS */}
            <div className="grid grid-cols-3 mt-6 text-center">

              {/* DATE */}
              <div>
                <p className="text-gray-600 text-sm">Date</p>
                <p className="font-bold text-black">{b.date}</p>
              </div>

              {/* TIME */}
              <div>
                <p className="text-gray-600 text-sm">Time</p>
                <p className="font-bold text-black">{b.time}</p>
              </div>

              {/* PRICE */}
              <div>
                <p className="text-gray-600 text-sm">Est. Cost</p>
                <p className="font-bold text-black">{b.price}</p>
              </div>
            </div>

            {/* CHARGER TYPE */}
            <div className="flex items-center mt-5 bg-emerald-50 p-3 rounded-xl">
              <MdEvStation className="text-emerald-600 mr-3" size={25} />
              <span className="font-medium text-black">{b.charger}</span>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingsPage;
