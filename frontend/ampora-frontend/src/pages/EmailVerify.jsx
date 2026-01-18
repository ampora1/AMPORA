import React, { useState } from "react";
import Loading from "../components/Loading";

export default function EmailVerify({ onNext }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      setError("");

      const res = await fetch(
        `http://localhost:8083/password-reset/send-verification-email?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" }
        }
      );

      if (!res.ok) throw new Error("Invalid email");

      const data = await res.json();
      console.log(data);

      // onNext(); // enable when backend confirms success
    } catch (err) {
      setError("Invalid email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    isLoading ? (
      <Loading />
    ) : (
      <div className="min-h-screen w-screen flex justify-center items-center bg-[#EDFEFF] fixed top-0 right-0 left-0">
        <div className="bg-white w-[400px] rounded-xl shadow-md p-10 ">
          <h2 className="text-2xl font-bold text-emerald-700 text-center mb-2">
            Reset your password
          </h2>
          <div className="flex justify-center items-center ">
          <p className="text-gray-600 mb-9 text-center font-normal">
          Enter your user account's verified email address and we will send your a password reset link
          </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Enter your email address"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mb-6"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-2 hover:opacity-90 transition disabled:opacity-50"
            >
              Send password reset email
            </button>
          </form>
        </div>
      </div>
    )
  );
}
