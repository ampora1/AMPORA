import React, { useState } from "react";
import { FiMapPin, FiChevronDown } from "react-icons/fi";
import { LuZap } from "react-icons/lu";

const StationCard = ({ station, selectedCharger, onSelectCharger }) => {
  const chargers = station.chargers || [];
  const [open, setOpen] = useState(false);

  const availableChargers = chargers.filter(c => c.status === "AVAILABLE");
  const maxPower = Math.max(...chargers.map(c => c.powerKw || 0), 0);

  return (
    <div className="w-full bg-white rounded-3xl shadow-md p-6
                    border border-emerald-200 transition-all">

      {/* ================= HEADER ================= */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          {station.name}
        </h2>

        <div className="flex items-center text-gray-500 mt-1 text-sm">
          <FiMapPin size={14} className="mr-1 text-emerald-500" />
          <p className="line-clamp-1">{station.address}</p>
        </div>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-3 gap-3 text-center mt-6">
        <Stat label="Chargers">
          {availableChargers.length}/{chargers.length}
        </Stat>

        <Stat label="Status">
          {availableChargers.length > 0 ? "Available" : "Busy"}
        </Stat>

        <Stat label="Max Power">
          {maxPower} kW
        </Stat>
      </div>

      {/* ================= CHARGER DROPDOWN ================= */}
      {chargers.length > 0 && (
        <div className="mt-6">

          <button
            onClick={() => setOpen(!open)}
            className="w-full flex items-center justify-between
                       border border-emerald-300 rounded-xl
                       px-4 py-3 text-left
                       hover:bg-emerald-50 transition"
          >
            <div>
              <p className="text-sm text-gray-500">Selected Charger</p>
              <p className="font-semibold text-gray-800">
                {selectedCharger
                  ? `${selectedCharger.type} • ${selectedCharger.powerKw} kW`
                  : "Choose a charger"}
              </p>
            </div>

            <FiChevronDown
              className={`text-emerald-500 transition-transform
                ${open ? "rotate-180" : ""}`}
            />
          </button>

          {/* ================= DROPDOWN LIST ================= */}
          {open && (
            <div className="mt-2 border border-emerald-200
                            rounded-xl overflow-hidden">

              {chargers.map(charger => {
                const isSelected = selectedCharger?.id === charger.id;
                const disabled = charger.status !== "AVAILABLE";

                return (
                  <button
                    key={charger.id}
                    disabled={disabled}
                    onClick={() => {
                      onSelectCharger(charger);
                      setOpen(false);
                    }}
                    className={`w-full px-4 py-3 flex justify-between items-center
                      text-left border-b last:border-b-0
                      transition
                      ${
                        disabled
                          ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                          : isSelected
                          ? "bg-emerald-100"
                          : "hover:bg-emerald-50"
                      }`}
                  >
                    <div>
                      <p className="font-medium">
                        {charger.type}
                      </p>
                      <p className="text-xs text-gray-500">
                        {charger.powerKw} kW
                      </p>
                    </div>

                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full
                        ${
                          charger.status === "AVAILABLE"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                    >
                      {charger.status}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ================= STAT ================= */
function Stat({ label, children }) {
  return (
    <div className="bg-[#edffff] rounded-xl py-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-bold text-emerald-600">
        {children}
      </p>
    </div>
  );
}

export default StationCard;
