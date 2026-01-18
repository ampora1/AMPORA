import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { FiCreditCard, FiLock } from "react-icons/fi";
import { FaCcVisa, FaCcMastercard } from "react-icons/fa";

const EV_GREEN = "#00d491";
const BACKEND = "http://localhost:8083";

export default function Payment() {
  const { state } = useLocation();
  const [loading, setLoading] = useState(false);

  /* ================= SAFETY CHECK ================= */
  if (!state || state.type !== "BOOKING" || !state.booking || !state.bill) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600 font-semibold">
          Invalid or expired payment session
        </p>
      </div>
    );
  }

  /* ================= SESSION DATA ================= */
  const booking = state.booking;
  const chargingId = booking.chargerId;
  const userId = booking.userId;
  const amount = Number(state.bill).toFixed(2);
  const duration = Number(booking.duration); 
  const startTime =booking.startTime;// ✅ INTEGER
  const orderId = `BOOK_${Date.now()}`;
  const date = booking.date;


  const user = {
    firstName: "Sangeeth",
    lastName: "Lakshan",
    email: "user@email.com",
    phone: "0770000000",
  };

  /* ================= PAYHERE PAYMENT ================= */
  async function handlePayHerePayment() {
    try {
      setLoading(true);
 alert(duration + booking.chargerId + date + booking.startTime + booking.userId);
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
      if (!data.hash) {
        alert("Payment initialization failed");
        return;
      }

      const form = document.createElement("form");
      form.method = "POST";
      form.action = "https://sandbox.payhere.lk/pay/checkout";

      const fields = {
  merchant_id: data.merchantId,

  return_url: "http://localhost:5173/payment-success",
  cancel_url: "http://localhost:5173/payment-cancel",
  notify_url: "https://762b0fdf374e.ngrok-free.app/api/payment/payhere/notify1",

  order_id: orderId,
  items: "EV Charging Slot Booking",
  currency: "LKR",
  amount,

  // ✅ ALWAYS USE booking.*
  custom_1: String(booking.chargerId),
  custom_2: String(booking.date),
  custom_3: String(booking.startTime),
  custom_4: String(booking.duration),
  custom_5: String(booking.userId),

  first_name: user.firstName,
  last_name: user.lastName,
  email: user.email,
  phone: user.phone,
  address: "Sri Lanka",
  city: "Colombo",
  country: "Sri Lanka",

  hash: data.hash,
};
      Object.entries(fields).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      console.error(err);
      alert("Payment error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-teal-100 pb-16">
      <div className="relative h-[32vh] rounded-b-[70px] overflow-hidden
                      bg-gradient-to-tr from-teal-900 via-emerald-800 to-teal-700">
        <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-5xl font-extrabold text-white">
            Secure <span className="text-emerald-300">Booking Payment</span>
          </h1>
          <p className="mt-3 text-emerald-100 text-lg">
            Confirm your charging slot
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-10 grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        <div className="md:col-span-2 bg-white rounded-3xl p-8 shadow-xl">
          <h2 className="text-xl font-bold mb-6 text-gray-800">
            Booking Summary
          </h2>

          <div className="space-y-4">
            <SummaryRow label="Date" value={booking.date} />
            <SummaryRow label="Start Time" value={booking.startTime} />
            <SummaryRow label="Duration" value={`${duration} hour(s)`} />

            <div className="border-t pt-4 flex justify-between font-bold text-lg">
              <span>Booking Fee</span>
              <span className="text-emerald-600">LKR {amount}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-xl">
          <h2 className="text-lg font-bold mb-4">Payment Method</h2>

          <div className="w-full flex items-center justify-between p-4 rounded-2xl border
                          border-emerald-500 bg-[#edffff]">
            <div className="flex items-center gap-3">
              <FiCreditCard className="text-emerald-600 text-xl" />
              <span className="font-medium">Card / PayHere</span>
            </div>
            <div className="flex gap-2 text-2xl text-gray-500">
              <FaCcVisa />
              <FaCcMastercard />
            </div>
          </div>

          <button
            onClick={handlePayHerePayment}
            disabled={loading}
            className="mt-6 w-full py-4 rounded-2xl font-semibold text-black
                       shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50"
            style={{ background: EV_GREEN }}
          >
            {loading ? "Redirecting..." : "Pay & Confirm Booking"}
          </button>

          <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 justify-center">
            <FiLock />
            <span>Secure 256-bit SSL encrypted payment</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex justify-between text-gray-700">
      <span>{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
