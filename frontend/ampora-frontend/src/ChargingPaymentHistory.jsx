import React, { useEffect, useState } from "react";
import { FiZap, FiClock, FiCreditCard } from "react-icons/fi";

const BACKEND = "https://ampora.dev";
const SERVICE_CHARGE = 200;

export default function ChargingPaymentHistory() {
  const userId = localStorage.getItem("userId");
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BACKEND}/api/charging-payments/user/${userId}`)
      .then(res => res.json())
      .then(data => {
        setPayments(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading payment history…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#edffff] px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="text-center">
          <div className="mx-auto w-14 h-14 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <FiZap size={26} />
          </div>
          <h1 className="mt-4 text-3xl font-extrabold text-gray-800">
            Charging Payments
          </h1>
          <p className="text-gray-500 mt-1">
            Your EV charging payment history
          </p>
        </div>

        {/* EMPTY */}
        {payments.length === 0 && (
          <div className="bg-white rounded-3xl shadow p-8 text-center text-gray-500">
            No charging payments found
          </div>
        )}

        {/* LIST */}
        <div className="grid gap-4 md:grid-cols-2">
          {payments.map(p => {
            const energyCost = Number(p.amount);
            const total = energyCost + SERVICE_CHARGE;

            return (
              <div
                key={p.id}
                className="bg-white rounded-3xl shadow-md p-6 space-y-4 hover:shadow-xl transition"
              >
                {/* TOP */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    #{p.id.slice(0, 8)}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold
                      ${p.status === "PAID"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-yellow-100 text-yellow-700"}`}
                  >
                    {p.status}
                  </span>
                </div>

                {/* INFO */}
                <div className="space-y-2 text-sm text-gray-700">
                  <Row icon={<FiZap />} label="Energy Used" value={`${p.energyUsed.toFixed(3)} kWh`} />
                  <Row icon={<FiCreditCard />} label="Energy Cost" value={`LKR ${energyCost.toFixed(2)}`} />
                  <Row label="Service Charge" value={`LKR ${SERVICE_CHARGE}.00`} />
                </div>

                {/* TOTAL */}
                <div className="border-t pt-4 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-emerald-600">
                    LKR {total.toFixed(2)}
                  </span>
                </div>

                {/* DATE */}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FiClock />
                  {new Date(p.createdAt).toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ===== ROW ===== */
function Row({ icon, label, value }) {
  return (
    <div className="flex justify-between items-center">
      <span className="flex items-center gap-2 text-gray-600">
        {icon}
        {label}
      </span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
