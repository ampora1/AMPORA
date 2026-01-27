// TopStationsFromSessionsFetch.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { fetchChargers } from "../api/chargerService";

export default function TopStationsFromSessionsFetch({
  booking = [],
  topN = 5,
}) {
  const [chargers, setChargers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const data = await fetchChargers();
        if (mounted) setChargers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch chargers", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => (mounted = false);
  }, []);

  const data = useMemo(() => {
    // chargerId → stationName
    const chargerToStation = new Map();

    chargers.forEach((ch) => {
      const chargerId = ch.chargerId ?? ch.chargerID ?? ch.id;
      const stationName =
        ch.stationName ?? ch.station ?? ch.stationId ?? "Unknown Station";

      if (chargerId) chargerToStation.set(chargerId, stationName);
    });

    // aggregate revenue per station
    const agg = new Map();

    booking.forEach((b) => {
      const chargerId = b.chargerId ?? b.chargerID ?? b.charger;
      const stationName = chargerToStation.get(chargerId) ?? "Unknown Station";

      const revenue = Number(b.amount ?? 0);
      if (!Number.isFinite(revenue)) return;

      agg.set(stationName, (agg.get(stationName) || 0) + revenue);
    });

    return Array.from(agg.entries())
      .map(([station, revenue]) => ({ station, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, topN);
  }, [booking, chargers, topN]);

  if (loading)
    return (
      <div className="p-4 text-sm text-gray-500">Loading top stations...</div>
    );

  if (data.length === 0)
    return (
      <div style={{ padding: 12 }}>
        <h3>Top Stations</h3>
        <div className="text-sm text-gray-500">No data to display</div>
      </div>
    );

  return (
    <div style={{ width: "100%", height: 300, padding: 12 }}>
      <h3 style={{ marginBottom: 8 }}>Top Stations</h3>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="station" />
          <YAxis />
          <Tooltip formatter={(v) => `₹ ${v}`} />
          <Bar dataKey="revenue" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
