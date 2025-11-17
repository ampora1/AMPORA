import React, { useState } from "react";
import MapView from "./MapView";
import StationCard from "./StationCard";
import RouteSummary from "./RouteSummary";
import calculateEnergy from "./EnergyCalculator";
import icon1 from "../../assets/placeholder.png";

const TripPlanner = () => {
    const [currentLocation, setCurrentLocation] = useState("");
    const [destination, setDestination] = useState("");
    const [battery, setBattery] = useState("");

    const [stops, setStops] = useState([{ id: 1, location: "" }]);
    const [routeData, setRouteData] = useState(null);
    const [stations, setStations] = useState([]);
    const [energy, setEnergy] = useState(null);

    const handleRouteCalculated = (data) => {
        setRouteData(data);
        const totalDistance = data?.totalDistanceKm || 0;

        const energyUsage = calculateEnergy(totalDistance, 0.18);
        setEnergy(energyUsage);

        setStations([
            { id: 1, name: "Ampora Station 1", distance: 1.2, status: "Available" },
            { id: 2, name: "Ampora Station 2", distance: 3.7, status: "Busy" },
            { id: 3, name: "Ampora Station 3", distance: 5.1, status: "Available" },
        ]);
    };

    return (
        <div className="w-screen min-h-screen flex flex-col items-center bg-[#E6FCF9]">

            {/* 🔥 Modern Gradient Banner */}
            <div className="relative w-full h-[35vh] bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-700 rounded-b-[50px] shadow-lg">
                <div className="absolute inset-0 flex flex-col justify-center items-center text-white drop-shadow-xl">
                    <h1 className="text-5xl font-extrabold tracking-wide">TRIP PLANNER</h1>
                    <p className="mt-3 text-lg opacity-90 font-light">
                        Plan your electric journey effortlessly ⚡
                    </p>
                </div>
            </div>

            {/* ✨ Route Input Card */}
            <div className="w-10/12 bg-white rounded-3xl shadow-2xl px-10 py-8 mt-[-60px] backdrop-blur-xl bg-opacity-90 border border-emerald-100">

                {/* Input Fields */}
                <div className="grid grid-cols-3 gap-6">

                    {/* Location */}
                    <div className="flex flex-col">
                        <label className="text-emerald-700 font-semibold mb-2">Current Location</label>
                        <input
                            type="text"
                            value={currentLocation}
                            onChange={(e) => setCurrentLocation(e.target.value)}
                            placeholder="Enter your starting point"
                            className="p-3 rounded-xl border border-emerald-300 focus:ring-2 text-black focus:ring-emerald-500 outline-none shadow-sm"
                        />
                    </div>

                    {/* Destination */}
                    <div className="flex flex-col">
                        <label className="text-emerald-700 font-semibold mb-2">Destination</label>
                        <input
                            type="text"
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                            placeholder="Enter destination"
                            className="p-3 rounded-xl border border-emerald-300 focus:ring-2 text-black focus:ring-emerald-500 outline-none shadow-sm"
                        />
                    </div>

                    {/* Battery */}
                    <div className="flex flex-col">
                        <label className="text-emerald-700 font-semibold mb-2">Battery Level (%)</label>
                        <input
                            type="number"
                            value={battery}
                            onChange={(e) => setBattery(e.target.value)}
                            placeholder="Ex: 65"
                            className="p-3 rounded-xl border border-emerald-300 focus:ring-2 text-black focus:ring-emerald-500 outline-none shadow-sm"
                        />
                    </div>
                </div>

                {/* 🚀 Calculate Button */}
                <div className="w-full flex justify-end mt-6">
                    <button className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:bg-emerald-700 hover:shadow-xl transition-all duration-200">
                        Calculate Route
                    </button>
                </div>
            </div>

            {/* 🗺️ Map + Stations */}
            <div className="w-10/12 mt-10 flex gap-6">

                {/* Map */}
                <div className="w-8/12 h-[70vh] rounded-3xl shadow-2xl overflow-hidden bg-white border border-emerald-100">
                    <MapView stops={stops} onRouteReady={handleRouteCalculated} />
                </div>

                {/* Station List */}
                <div className="w-4/12 h-[70vh] overflow-y-auto bg-white rounded-3xl shadow-2xl p-6 border border-emerald-100">
                    <h2 className="text-2xl font-bold text-emerald-700 mb-4">Nearby Stations</h2>

                    <div className="border-2 w-12/12 rounded-2xl p-5 bg-amber-200">
                        <p className="text-black text-2xl font-bold">GreenCharge Downtown</p>
                        <div className="flex">
                            <img src={icon1} className=" w-[20px] h-[20px]" />
                            <p className="text-black">123 Main St, Colombo</p>
                        </div>
                        <div>
                            <p className="text-black">Available Chargers</p>
                            <p className="text-black">10</p>
                        </div>

                    </div>
                </div>
            </div>

            {/* Summary */}
            {routeData && (
                <div className="w-10/12 mt-10">
                    <RouteSummary data={routeData} energy={energy} battery={battery} />
                </div>
            )}
        </div>
    );
};

export default TripPlanner;
