import React from 'react'
import { useState } from "react";

export default function EmailVerify({ onNext }) {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    
    onNext(); 
  };
  return (
    <div className="min-h-screen w-screen flex  flex-row overflow-hidden p-4 justify-center bg-[#EDFEFF] fixed top-0 right-0 left-0">
      <div className="bg-white w-[380px] h-[400px] rounded-xl shadow-md p-10 ">
        <h2 className="text-2xl font-extrabold text-emerald-700 text-center mb-8">
          Verify Your Account
        </h2>

        <form className="space-y-4 onSubmit={handleSubmit}">
          <input
            type="email"
            placeholder="Enter Your Email..."
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mb-7"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            
          />

          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-2 rounded-lg hover:bg-green-700 transition"
          >
            Verify Email
          </button>
          </form>
      </div>
    </div>
    // <div>
    //     <h1>Hello There</h1>
    // </div>
  )
}
