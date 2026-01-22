import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { FiCreditCard, FiLock } from "react-icons/fi";
import { FaCcVisa, FaCcMastercard } from "react-icons/fa";

const BACKEND = "http://localhost:8083";
const EV_GREEN = "#00d491";

export default function Payment() {
  const { state } = useLocation();
  const [loading, setLoading] = useState(false);

  

  const { bookingId, bill } = state;
  const amount = Number(bill).toFixed(2);
  const orderId = `BOOKING_${Date.now()}`;

  async function handlePayHerePayment() {
    try {
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
        return_url: "http://localhost:5173/payment-success",
        cancel_url: "http://localhost:5173/payment-cancel",
        notify_url: "https://6d3fe76cf357.ngrok-free.app/api/payment/payhere/notify1",

        order_id: orderId,
        items: "EV Charging Slot Booking",
        currency: "LKR",
        amount,

        custom_1: bookingId,

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

    } catch (err) {
      alert("Payment error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-teal-100 pb-16">
      <div className="max-w-md mx-auto mt-24 bg-white p-8 rounded-3xl shadow-xl">
        <h2 className="text-2xl font-bold text-center mb-6">
          Booking Payment
        </h2>

        <p className="text-center mb-4">
          Amount: <strong>LKR {amount}</strong>
        </p>

        <button
          onClick={handlePayHerePayment}
          disabled={loading}
          className="w-full py-4 rounded-xl font-semibold shadow"
          style={{ background: EV_GREEN }}
        >
          {loading ? "Redirecting..." : "Pay with PayHere"}
        </button>

        <div className="mt-4 text-xs text-center text-gray-500 flex gap-2 justify-center">
          <FiLock /> Secure PayHere Checkout
        </div>

        <div className="flex justify-center gap-3 mt-3 text-2xl text-gray-400">
          <FaCcVisa />
          <FaCcMastercard />
        </div>
      </div>
    </div>
  );
}
