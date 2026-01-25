import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Loading from "../components/Loading";

export default function EmailOtpVerify() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setIsLoading] = useState(false);
  

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }

    try {
     
      const res = await fetch(
        `http://localhost:8083/password-reset/verify-code/${id}`,        
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: enteredOtp })
        }
      );

      if (!res.ok) {
        throw new Error("Invalid or expired OTP");
      }

      const data = await res.json();
      navigate(`/password-reset/forget/${data.object}`);

    } catch (err) {
      setError(err.message || "OTP verification failed");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    loading ? <Loading/>:(
      <div className="min-h-screen flex items-center justify-center bg-[#EDFEFF]">
      <div className="bg-white w-[420px] rounded-xl shadow-md p-8 text-center">
        <h2 className="text-2xl font-bold text-emerald-700 mb-2">Verify your account</h2>
        <p className="text-sm text-gray-500 mb-6">
          We have sent a code to your Email
        </p>

        <form onSubmit={handleSubmit}>
          <div className="flex justify-center gap-3 mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                className="w-12 h-12 border border-gray-300 rounded-md text-center text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            ))}
              
            
          </div>

           {error && (
            <p className="text-red-500 text-sm mb-4">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-2 rounded-lg hover:bg-green-700 transition"
          >
             {loading ? "Verifying..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
    )
  );
}
