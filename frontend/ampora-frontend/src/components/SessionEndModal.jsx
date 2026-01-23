import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function SessionEndModal({ billInfo, onClose }) {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  if (!billInfo) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-8 w-[360px] shadow-xl"
      >
        <h2 className="text-2xl font-bold text-emerald-700 mb-4">
          Charging Session Ended
        </h2>

        <div className="space-y-2 text-sm">
          <p>
            Energy Used:{" "}
            <b>{billInfo.energy?.toFixed(3) ?? "0.000"} kWh</b>
          </p>
          <p className="text-lg">
            Total Bill:{" "}
            <b>LKR {billInfo.bill?.toFixed(2) ?? "0.00"}</b>
          </p>
        </div>

        <div className="flex gap-3 mt-6">
          <button
  onClick={async () => {
    try {
      const res = await fetch(
        "http://localhost:8083/api/charging-payments/pending",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: "SESSION_ID_00000",
            userId: userId,
            energy: billInfo.energy,
            amount: billInfo.bill,
          }),
        }
      );

      if (!res.ok) {
        alert("Failed to create charging payment");
        return;
      }

      const data = await res.json();

      navigate("/charging-payment", {
        state: {
          chargingPaymentId: data.chargingPaymentId,
          bill: billInfo.bill,
        },
      });

    } catch (err) {
      alert("Charging payment error");
    }
  }}
  className="flex-1 bg-emerald-600 text-white py-2 rounded-lg font-semibold"
>
  Pay Now
</button>

          <button
            onClick={onClose}
            className="flex-1 border py-2 rounded-lg hover:bg-gray-100 transition"
          >
            Later
          </button>
        </div>
      </motion.div>
    </div>
  );
}
