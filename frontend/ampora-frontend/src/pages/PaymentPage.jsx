import React from "react";
import { FaCheckCircle } from "react-icons/fa";

const PaymentPage = () => {
  const plans = [
    {
      id: 1,
      name: "Basic",
      price: "$9.99",
      period: "/month",
      features: [
        "Access to 300+ charging stations",
        "Standard customer support",
        "Basic trip planning",
        "2 free fast charges per month",
      ],
      highlight: false,
    },
    {
      id: 2,
      name: "Premium",
      price: "$19.99",
      period: "/month",
      features: [
        "Access to all Ampora stations",
        "Priority fast-charging",
        "AI-powered trip optimization",
        "Unlimited fast charges",
        "Dedicated 24/7 support",
      ],
      highlight: true, // Recommended plan
    },
    {
      id: 3,
      name: "Enterprise",
      price: "$49.99",
      period: "/month",
      features: [
        "Fleet management dashboard",
        "Bulk charging discounts",
        "Real-time analytics",
        "Dedicated account manager",
        "Custom integrations",
      ],
      highlight: false,
    },
  ];

  return (
    <div className="w-screen min-h-screen bg-[#EDFFFF] flex flex-col items-center p-10">

      {/* Title */}
      <h1 className="text-4xl font-bold text-emerald-600 mb-3 mt-5">
        Choose Your Plan
      </h1>
      <p className="text-gray-600 text-lg mb-10">
        Upgrade to unlock powerful features for your EV journey
      </p>

      {/* Pricing Cards */}
      <div className="w-10/12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((p) => (
          <div
            key={p.id}
            className={`rounded-3xl p-7 shadow-xl bg-white border 
              ${p.highlight ? "border-emerald-500 scale-105" : "border-gray-200"} 
              transition-transform hover:scale-105`}
          >
            {/* PLAN NAME */}
            <h2 className="text-2xl font-bold text-black text-center mb-3">
              {p.name}
            </h2>

            {/* PRICE */}
            <div className="text-center mb-6">
              <span className="text-4xl font-extrabold text-emerald-600">{p.price}</span>
              <span className="text-gray-600">{p.period}</span>
            </div>

            {/* FEATURES */}
            <ul className="mb-6 space-y-3">
              {p.features.map((f, index) => (
                <li key={index} className="flex items-center gap-3 text-gray-700">
                  <FaCheckCircle className="text-emerald-500" />
                  {f}
                </li>
              ))}
            </ul>

            {/* BUTTON */}
            <div className="flex justify-center">
              <button
                className={`px-6 py-3 rounded-xl text-white font-semibold
                  ${p.highlight ? "bg-emerald-600" : "bg-emerald-400"} 
                  hover:bg-emerald-700 transition-all`}
              >
                {p.highlight ? "Get Premium" : "Choose Plan"}
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default PaymentPage;
