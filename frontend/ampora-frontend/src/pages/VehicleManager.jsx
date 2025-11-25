// src/pages/VehicleManager.jsx
import React, { useState } from "react";
import { MdDirectionsCar } from "react-icons/md";
import { TbBatteryCharging } from "react-icons/tb";
import { FiPlus, FiStar } from "react-icons/fi";

const glass = "backdrop-blur-xl bg-white/70 border border-emerald-200/60 shadow-[0_8px_35px_rgba(16,185,129,0.12)]";

export default function VehicleManager() {
  const [vehicles, setVehicles] = useState([
    { id: 1, brand: "Nissan", model: "Leaf", variant: "40 kWh", plate: "WP-CAD-4123", default: true, connector: "CHAdeMO", rangeKm: 240 },
    { id: 2, brand: "BYD", model: "Atto 3", variant: "60 kWh", plate: "WP-KY-8712", default: false, connector: "CCS2", rangeKm: 420 },
  ]);

  const makeDefault = (id) => {
    setVehicles((prev) => prev.map((v) => ({ ...v, default: v.id === id })));
  };

  return (
    <div className="w-screen min-h-screen bg-gradient-to-b from-emerald-50 via-teal-50 to-white text-gray-900">
      <div className="mx-auto w-11/12 max-w-6xl py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-extrabold text-emerald-700">My Vehicles</h1>
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700">
            <FiPlus /> Add Vehicle
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vehicles.map((v) => (
            <div key={v.id} className={`${glass} rounded-2xl p-5`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid place-items-center w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 text-2xl">
                    <MdDirectionsCar />
                  </div>
                  <div>
                    <div className="font-bold text-emerald-900">
                      {v.brand} {v.model} • {v.variant}
                    </div>
                    <div className="text-sm text-emerald-900/70">Plate: {v.plate}</div>
                  </div>
                </div>

                {v.default && (
                  <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-700">
                    <FiStar /> Default
                  </span>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <Info label="Range" value={`${v.rangeKm} km`} />
                <Info label="Connector" value={v.connector} />
              </div>

              <div className="mt-4 flex items-center gap-3">
                <a href="/trip" className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700">
                  Plan with this
                </a>
                {!v.default && (
                  <button
                    onClick={() => makeDefault(v.id)}
                    className="px-4 py-2 rounded-lg border border-emerald-300 text-emerald-700 text-sm hover:bg-emerald-50"
                  >
                    Set as default
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className={`${glass} rounded-2xl p-5`}>
          <h2 className="text-lg font-semibold text-emerald-800 mb-2">Charging Tips</h2>
          <div className="text-sm text-emerald-900/80 flex items-center gap-2">
            <TbBatteryCharging className="text-emerald-600" /> Keep SOC between 20%–80% for longer battery life.
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <div className="text-emerald-900/70">{label}</div>
      <div className="font-semibold text-emerald-800">{value}</div>
    </div>
  );
}
