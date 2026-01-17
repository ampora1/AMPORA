import React, { useState } from "react";

export default function ForgetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password.length < 8) {
      alert("Password must contain at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    console.log("Password Reset Successful");
  };

  return (
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

           <a className="w-full h-12 flex items-center justify-center  p-3  bg-gradient-to-r from-emerald-500 to-teal-500 hover:bg-[#56DFCF] rounded-lg  shadow-md" href="">
            
            <span className=" text-white font-bold">Reset Password</span>
          </a>
          
        

        {/* Back to login */}
        
          <a href="/login">
            <p className="text-emerald-600 font-semibold hover:underline ">Back to Login</p>
          </a>
        </form>
      </div>
    </div>
  );
}
