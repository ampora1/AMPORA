import { useLocation } from "react-router-dom";
import { useState } from "react";
import { FiZap, FiCreditCard, FiLock } from "react-icons/fi";

const BACKEND = "https://ampora.dev";
const SERVICE_CHARGE = 200;

export default function ChargingPayment() {
  const { state } = useLocation();
  const [loading, setLoading] = useState(false);

  if (!state?.chargingPaymentId || !state?.bill || !state?.energy) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 font-semibold">
        Invalid or expired payment session
      </div>
    );
  }

  const { chargingPaymentId, bill, energy } = state;

  const energyCost = Number(bill);
  const total = energyCost + SERVICE_CHARGE;
  const orderId = `CHARGING_${Date.now()}`;

  async function payNow() {
    try {
      setLoading(true);

      const res = await fetch(`${BACKEND}/api/payment/payhere/hash`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          amount: total.toFixed(2),
          currency: "LKR",
        }),
      });

      const data = await res.json();

      const form = document.createElement("form");
      form.method = "POST";
      form.action = "https://sandbox.payhere.lk/pay/checkout";

      const fields = {
        merchant_id: data.merchantId,
        return_url: "https://ampora.dev/payment-success",
        cancel_url: "https://ampora.dev/payment-cancel",
        notify_url: "https://ampora.dev/api/payment/payhere/charging-notify",

        order_id: orderId,
        items: "EV Charging Session",
        currency: "LKR",
        amount: total.toFixed(2),

        custom_1: chargingPaymentId,

        first_name: "Sangeeth",
        last_name: "Lakshan",
        email: "user@email.com",
        phone: "0770000000",
        address: "Sri Lanka",
        city: "Colombo",
        country: "Sri Lanka",

        hash: data.hash,
      };

      Object.entries(fields).forEach(([k, v]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = k;
        input.value = v;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#edffff] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6 space-y-6">

        {/* HEADER */}
        <div className="text-center">
          <div className="mx-auto w-14 h-14 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <FiZap size={28} />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold text-gray-800">
            Charging Payment
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review your charging session
          </p>
        </div>

        {/* SUMMARY */}
        <div className="bg-[#edffff] rounded-2xl p-4 space-y-3">
          <Row label="Energy Used" value={`${energy.toFixed(3)} kWh`} />
          <Row label="Energy Cost" value={`LKR ${energyCost.toFixed(2)}`} />
          <Row label="Service Charge" value={`LKR ${SERVICE_CHARGE.toFixed(2)}`} />

          <div className="border-t pt-3 flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-emerald-600">
              LKR {total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* PAY BUTTON */}
        <button
          onClick={payNow}
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-semibold
                     shadow-lg hover:scale-[1.02] transition disabled:opacity-60"
        >
          {loading ? "Redirecting…" : "Pay with PayHere"}
        </button>

        {/* FOOTER */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <FiLock />
          <span>Secure payment powered by PayHere</span>
        </div>
      </div>
    </div>
  );
}

/* ===== SMALL ROW COMPONENT ===== */
function Row({ label, value }) {
  return (
    <div className="flex justify-between text-sm text-gray-700">
      <span>{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
