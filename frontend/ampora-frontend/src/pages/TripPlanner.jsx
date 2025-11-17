import React from "react";
import roadtrip from "../assets/road-trip.png";

const TripPlanner = () => {
  return (
    <div className="w-screen min-h-screen bg-[#EDFFFF] flex flex-col items-center">

      {/* TOP BANNER */}
      <div className="relative w-full h-[45vh] bg-gradient-to-r from-emerald-300 to-emerald-500 rounded-b-[80px] overflow-hidden">

        {/* CURVED WAVE */}
        <svg
          className="absolute bottom-0 left-0 w-full"
          viewBox="0 0 1440 320"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#EDFFFF"
            d="M0,256L40,245.3C80,235,160,213,240,197.3C320,181,400,171,480,176C560,181,640,203,720,218.7C800,235,880,245,960,234.7C1040,224,1120,192,1200,170.7C1280,149,1360,139,1400,133.3L1440,128L1440,320L0,320Z"
          ></path>
        </svg>

        {/* BANNER CONTENT */}
        <div className="absolute top-16 w-full flex flex-col items-center text-white">
          <h1 className="text-4xl font-bold drop-shadow-md">PLAN YOUR NEXT TRIP</h1>

          <div className="mt-6 flex gap-4 px-4 w-full justify-center">
            <input
              type="text"
              placeholder="Starting point"
              className="w-[250px] h-[50px] rounded-xl px-4 bg-white text-black border-2 border-emerald-400"
            />
            <input
              type="text"
              placeholder="Destination"
              className="w-[250px] h-[50px] rounded-xl px-4 bg-white text-black border-2 border-emerald-400"
            />
          </div>

          <button className="mt-6 bg-white text-emerald-600 px-6 py-3 rounded-xl font-semibold shadow hover:bg-gray-100">
            Plan Trip
          </button>
        </div>
      </div>

      {/* BODY SECTION */}
      <div className="mt-10 w-10/12 bg-white rounded-3xl shadow-lg p-8 flex gap-10">

        <img src={roadtrip} className="w-[180px] h-[180px]" alt="Roadtrip icon" />

        <div>
          <h2 className="text-2xl font-bold text-emerald-500">Trip Planner</h2>
          <p className="mt-4 text-gray-700 w-10/12 leading-relaxed">
            Plan your electric journey easily with real-time charging station
            locations, distance calculations, and optimized energy usage.  
            Enter your start and destination to see the best EV-friendly route.
          </p>

          <button className="mt-6 border-2 border-emerald-400 px-6 py-2 rounded-xl text-emerald-500 hover:bg-emerald-50">
            Start Planning
          </button>
        </div>

      </div>
    </div>
  );
};

export default TripPlanner;
