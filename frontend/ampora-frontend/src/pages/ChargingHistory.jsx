import React, { useEffect, useMemo, useState } from "react";
import { MdEvStation } from "react-icons/md";
import {
  FiFilter,
  FiUser,
  FiCalendar,
  FiCreditCard,
  FiZap,
  FiLogOut,
} from "react-icons/fi";
import { LuCar } from "react-icons/lu";
import SideNav from "../components/dashboard/SideNav";

const BACKEND = "https://ampora.dev";

const glass =
  "backdrop-blur-xl bg-white/70 border border-emerald-200/60 shadow-[0_8px_35px_rgba(16,185,129,0.12)]";

export default function ChargingHistory() {
  const [filter, setFilter] = useState("all");
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId");

  /* ================= FETCH USER CHARGING HISTORY ================= */
  useEffect(() => {
    fetch(`${BACKEND}/api/charging-payments/user/${userId}`)
      .then(res => res.json())
      .then(data => {
        const mapped = (data || []).map(p => ({
          id: p.id,
          station: "Ampora Charging Station", // optional (backend can extend later)
          date: new Date(p.createdAt).toISOString().slice(0, 10),
          kwh: p.energyUsed ?? 0,
          cost: p.amount ?? 0,
          type: "DC", // charging sessions are DC
          status: p.status,
        }));
        setSessions(mapped);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  /* ================= SUMMARY ================= */
  const summary = useMemo(() => {
    const list =
      filter === "all" ? sessions : sessions.filter(s => s.type === filter);

    return {
      totalKwh: list.reduce((a, b) => a + b.kwh, 0),
      totalCost: list.reduce((a, b) => a + b.cost, 0),
      count: list.length,
    };
  }, [filter, sessions]);

  function logoutFunction() {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    window.location.href = "/login";
  }

  const quickActions = [
    { title: "User Details", icon: <FiUser />, to: "/profile" },
    { title: "Vehicle Details", icon: <LuCar />, to: "/vehicles" },
    { title: "Bookings", icon: <FiCalendar />, to: "/bookings" },
    { title: "Plans & Subscription", icon: <FiCreditCard />, to: "/package" },
    { title: "Charging History", icon: <FiZap />, to: "/history" },
    { title: "Logout", icon: <FiLogOut />, onClick: logoutFunction, to: "/login" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading charging history…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b mt-20 from-emerald-50 via-teal-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* SideNav */}
          <div className="w-full lg:w-[260px] lg:sticky lg:top-24">
            <SideNav actions={quickActions} />
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-emerald-700">
                  Charging History
                </h1>
                <p className="text-emerald-900/70">
                  All your EV charging sessions and payments.
                </p>
              </div>

              {/* Filter */}
              <div className={`${glass} rounded-2xl p-2 flex items-center gap-2`}>
                <FiFilter className="text-emerald-600" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="bg-transparent outline-none text-emerald-800"
                >
                  <option value="all">All</option>
                  <option value="DC">DC Only</option>
                </select>
              </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <SummaryCard title="Sessions" value={summary.count} />
              <SummaryCard
                title="Energy (kWh)"
                value={summary.totalKwh.toFixed(3)}
              />
              <SummaryCard
                title="Total Spend (LKR)"
                value={summary.totalCost.toFixed(2)}
              />
            </div>

            {/* Table */}
            <div className={`${glass} rounded-2xl overflow-x-auto`}>
              <div className="min-w-[720px]">
                <div className="grid grid-cols-12 px-5 py-3 bg-emerald-50 text-emerald-800 font-semibold text-sm">
                  <div className="col-span-5">Station</div>
                  <div className="col-span-2">Date</div>
                  <div className="col-span-2">Type</div>
                  <div className="col-span-1">kWh</div>
                  <div className="col-span-2 text-right">Cost (LKR)</div>
                </div>

                {sessions
                  .filter(s => filter === "all" || s.type === filter)
                  .map((s) => (
                    <div
                      key={s.id}
                      className="grid grid-cols-12 px-5 py-3 border-t border-emerald-100 text-sm"
                    >
                      <div className="col-span-5 flex items-center gap-2">
                        <MdEvStation className="text-emerald-600" />
                        {s.station}
                      </div>
                      <div className="col-span-2">{s.date}</div>
                      <div className="col-span-2">{s.type}</div>
                      <div className="col-span-1">
                        {s.kwh.toFixed(3)}
                      </div>
                      <div className="col-span-2 text-right">
                        {s.cost.toFixed(2)}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {sessions.length === 0 && (
              <p className="text-center text-gray-500">
                No charging sessions found.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function SummaryCard({ title, value }) {
  return (
    <div className="backdrop-blur-xl bg-white/70 border border-emerald-200/60 shadow rounded-2xl p-5">
      <p className="text-sm text-emerald-900/70">{title}</p>
      <p className="text-2xl font-extrabold text-emerald-700">{value}</p>
    </div>
  );
}
