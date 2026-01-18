import { useState } from "react";

export default function EmailOtpVerify() {
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EDFEFF]">
      <div className="bg-white w-[420px] rounded-xl shadow-md p-8 text-center">
        <h2 className="text-2xl font-bold text-emerald-700 mb-2">Verify your account</h2>
        <p className="text-sm text-gray-500 mb-6">
          We have sent a code to your Email
        </p>

        <form>
          <div className="flex justify-center gap-3 mb-6">
            
              <input
                type="text"
                maxLength="1"
                className="w-12 h-12 border border-gray-300 rounded-md text-center text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="text"
                maxLength="1"
                className="w-12 h-12 border border-gray-300 rounded-md text-center text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="text"
                maxLength="1"
                className="w-12 h-12 border border-gray-300 rounded-md text-center text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="text"
                maxLength="1"
                className="w-12 h-12 border border-gray-300 rounded-md text-center text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="text"
                maxLength="1"
                className="w-12 h-12 border border-gray-300 rounded-md text-center text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="text"
                maxLength="1"
                className="w-12 h-12 border border-gray-300 rounded-md text-center text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-2 rounded-lg hover:bg-green-700 transition"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
