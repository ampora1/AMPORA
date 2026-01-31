import { useState } from "react";
import Loading from "../components/Loading";
import { useNavigate } from "react-router-dom";

export default function EmailVerify({ onNext }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(
        `http://localhost:8083/password-reset/send-verification-email?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" }
        }
      );

      const data = await res.json();

      if (!res.ok){
        setError("Invalid email");
      }else {
        navigate(`/password-reset/verify-otp/${data.object}`)
      }

    
    } catch (err) {
      throw new Error("Invalid email");    
    }finally{
      setIsLoading(false);
    }
  };

  return (
    isLoading ? <Loading/>

     : ( <div className="min-h-screen w-screen flex justify-center items-center bg-[#EDFEFF] fixed top-0 right-0 left-0">
      <div className="bg-white w-[380px] rounded-xl shadow-md p-10">
        <h2 className="text-2xl font-extrabold text-emerald-700 text-center mb-8">
          Verify Your Account
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter Your Valid Email..."
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-2 hover:opacity-90 transition"
          >
            Verify Email
          </button>
        </form>
      </div>
    </div>)
  );
}
