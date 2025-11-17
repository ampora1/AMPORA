import React from 'react'
import Loginimg from "../assets/Loginimg.png";
import { useState } from 'react';
import { Link } from 'react-router-dom';


export default function Login() {

  const[email,setEmail] = useState("");
  const[password,setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    console.log("Email:", email);
    console.log("Password:", password); 
  };

  return (
    // Main-Wrapper
    <div className="min-h-screen w-screen bg-[#EDFEFF] flex justify-center items-center  fixed top-0 right-0 left-0">
      <div className="bg-[#EDFEFF] w-[800px] h-[700px] flex flex-row gap-10 shadow-2xl overflow-hidden">

          {/* Login-Image */}
          <div className="w-[381px] h-full shadow-xl/30"  >
               <img 
                src={Loginimg} 
                alt="Login" 
                className="w-full h-full object-cover rounded-2xl"
              />
          </div>

          {/* Login-Form */}
          <div className="w-[381px] h-full rounded-2xl shadow-xl/30 bg-gray-100 p-10 flex flex-col">
                  <h3 class="font-inter font-bold text-[36px] text-[#000000] text-center mt-4">Welcome Back</h3>

                  <div className='flex flex-row gap-7 p-4 ml-5' >
                      <p> New user</p>
                      <Link ><p className='text-[#0ABAB5] hover:underline cursor-pointer'>| Create an Account</p></Link>
                  </div>

                  {/* Google Login */}
                  <a className="w-[250px] h-[30px] flex items-center justify-center gap-2 p-6 ml-7 bg-black hover:bg-[#505252] text-white font-inter rounded-full shadow-md" href=''>
                      <img
                           src="https://www.svgrepo.com/show/355037/google.svg"
                           alt="Google"
                          className="w-4"
                      /><p className=' text-white'>Sign in with Google</p>
                  </a> 
                  <Link ><p className="text-center font-[400px] font-inter text-gray-500 p-3 hover:underline">Or sign with email</p></Link>

                  <form className='flex flex-col items-center p-6'>
                      {/* Email */}
                      <input
                            type="email"
                            placeholder="Email Address"
                            className="w-[300px] h-[50px]  border border-gray-500 rounded-2xl px-4 mb-4 in-focus-visible: "
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                      />

                      {/* Password */}
                      <input
                            type="password"
                            placeholder="Password"
                            className="w-[300px] h-[50px] border border-gray-500 rounded-2xl px-4 mb-4 "
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
              
                      />

                      <div className="flex flex-row gap-8 w-[381px] pl-12 mt-2">
                          <label className="flex items-center gap-2 ">
                          <input type="checkbox" />
                           Remember me
                           </label>
                             
                        
                          <a href="/forgot" >
                            <p className='text-gray-700 hover:underline' > Forgot Password?</p>
                          </a>
                      </div>
                      <a
                        href=''
                        onClick={handleLogin}
                        className="bg-[#0ABAB5] hover:bg-[#56DFCF] text-white font-inter rounded-lg shadow-md transition-transform  w-[300px] h-[50px] px-8 py-3 mt-10 text-center"
                      >
                       <span className="text-white">Login</span>
                      </a>
                  </form>
          </div>
      </div>
    </div>
  )
}
