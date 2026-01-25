import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Loading from "../components/Loading";

export default function ForgetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { id } = useParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    setLoading(true);

    const res = await fetch(
      `http://localhost:8083/password-reset/reset-password/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newPassword: password,
          confirmPassword: confirmPassword,
        }),
      }
    );

    if (!res.ok) {
      const data = await res.json();
      setError(data.message || "Password reset failed");
      return;
    }

    navigate("/login");

  } catch (err) {
    setError("Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
};


  return (
    loading ? <Loading/> : (
      <div className="min-h-screen w-screen flex  flex-row overflow-hidden p-4 justify-center bg-[#EDFEFF] fixed top-0 right-0 left-0">
     
      <div className="w-[500px] h-[600px] bg-white rounded-2xl shadow-xl/30 p-10 text-center">
        <div className=" p-8">
        <h2 className="text-3xl font-extrabold text-emerald-700 mb-2 ">Forget Password</h2>
        <p className="text-gray-600 mb-4">
          Enter your New password below to complete the reset process
        </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 ">
          {/* Password */}
          <div className="text-left">
           
            <input
              type="password"
               placeholder="Password"
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
           
          </div>

          {/* Confirm Password */}
          <div className="text-left">
          
            <input
              type="password"
               placeholder="confirm Password"
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            
          </div>

          <button
            type="submit"
            className="w-full h-12 flex items-center justify-center bg-gradient-to-r from-emerald-500 to-teal-500 hover:bg-[#56DFCF] rounded-lg shadow-md"
          >
            <span className="text-white font-bold">Reset Password</span>
          </button>

        

        {/* Back to login */}
        
          <a href="/login">
            <p className="text-emerald-600 font-semibold hover:underline ">Back to Login</p>
          </a>
        </form>
      </div>
    </div>
    )
  );
}
