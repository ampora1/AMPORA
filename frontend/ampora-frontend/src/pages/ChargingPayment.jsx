import { useLocation } from "react-router-dom";
import { useState } from "react";

const BACKEND = "http://13.211.243.202:8083";

export default function ChargingPayment() {
  const { state } = useLocation();
  const [loading, setLoading] = useState(false);

  if (!state?.chargingPaymentId || !state?.bill) {
    return <p className="p-10 text-red-600">Invalid payment session</p>;
  }

  const { chargingPaymentId, bill } = state;
  const amount = bill.toFixed(2);
  const orderId = `CHARGING_${Date.now()}`;

  async function payNow() {
    setLoading(true);

    const res = await fetch(`${BACKEND}/api/payment/payhere/hash`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        amount,
        currency: "LKR",
      }),
    });

    const data = await res.json();

    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://sandbox.payhere.lk/pay/checkout";

    const fields = {
      merchant_id: data.merchantId,
      return_url: "http://15.134.60.252/payment-success",
      cancel_url: "http://15.134.60.252/payment-cancel",
      notify_url:
        "http://13.211.243.202:8083/api/payment/payhere/charging-notify",

      order_id: orderId,
      items: "EV Charging Session Payment",
      currency: "LKR",
      amount,

      // ✅ ONLY THIS
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
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <button
        onClick={payNow}
        disabled={loading}
        className="px-6 py-3 bg-emerald-600 text-white rounded-xl"
      >
        {loading ? "Redirecting..." : `Pay LKR ${amount}`}
      </button>
    </div>
  );
}
