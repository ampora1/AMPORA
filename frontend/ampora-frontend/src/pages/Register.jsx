
import React, { useState } from "react";
import Reg from "../assets/Reg.jpg"; 

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen w-screen flex  flex-row overflow-hidden p-4 justify-center bg-[#EDFEFF] fixed top-0 right-0 left-0">
     <div className="w-full h-[700px] flex border rounded shadow-xl/30 bg-white">
      {/* =============Image============= */}
      <div className="w-1/2 h-full ">
        <img
          src={Reg}
          alt="Signup Visual"
          className=" w-full h-full object-cover"
        />
      </div>

      {/* =================Form===================== */}
      <div className="w-1/2 flex  items-center  border ">
        <form className="w-[380px] border p-4 shadow-2xl">
          
          <h2 className="text-3xl font-bold mb-2">Sign up</h2>

          <input
              type="text"
              placeholder="First name"
              className="w-full border border-gray-400 rounded-md p-3 mb-5 focus:outline-none"
          />

          <input
              type="text"
              placeholder="Last name"
              className="w-full border border-gray-400 rounded-md p-3 mb-5 focus:outline-none"
          />

          <input
              type="text"
              placeholder="Phone no"
              className="w-full border border-gray-400 rounded-md p-3 mb-5 focus:outline-none"
          />
          
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full border border-gray-400 rounded-md p-3 mb-5 focus:outline-none"
          />

          
          
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter password"
            className="w-full border border-gray-400 rounded-md p-3 mb-3 focus:outline-none"
          />

          <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm password"
              className="w-full border border-gray-400 rounded-md p-3 mb-5 focus:outline-none"
          />

          
          <div className="flex items-center gap-2 mb-6">
            <input
              type="checkbox"
              onChange={() => setShowPassword(!showPassword)}
            />
            <label>Show password</label>
          </div>
          
          <button className="w-full bg-white text-gray-500 p-3 rounded-md font-semibold mb-6">
            Sign Up
          </button>
          
          {/* Divider */}
          <div className="flex items-center mb-6">
            <hr className="flex-grow border-gray-300" />
            <span className="mx-3 text-gray-500">or</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          {/* Google Button */}
          <a className="w-full flex items-center justify-center gap-3 border border-gray-800 py-3 rounded-md bg-gray-300  hover:bg-[#505252] " href="">
            <img
              src="https://www.svgrepo.com/show/355037/google.svg"
              className="w-6"
              alt="Google"
            />
            Continue With Google
          </a>
          </form>
        </div>
        </div>
     </div>
  );
}
