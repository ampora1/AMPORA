import React from 'react'
import Loginimg from "../assets/Loginimg.png";


export default function Login() {
  return (
    <div className="min-h-screen w-screen bg-[#EDFEFF] flex justify-center items-center  fixed top-0 right-0 left-0">
      <div className=" border border-indigo-500 bg-[#EDFEFF] w-[840px] h-[700px] flex flex-row gap-20 ">

        {/* Login-Image */}
        <div className="w-[381px] h-[700px] border border-purple-500  shadow-md "  >
               <img 
                src={Loginimg} 
                alt="Login" 
                className="w-full h-full object-cover rounded-2xl"
              />
           </div>

           {/* Login-Form */}
           <div className="w-[381px] h-[700px]  border border-sky-500  rounded-2xl shadow-md">
                  <p class="font-inter font-bold text-[36px] leading-none tracking-normal text-[#000000] text-center mt-15">Welcome Back</p>
                  <div className="mb-6">
                      <span>New user? </span>Create an Account
            
                  </div>
                  
                  {/* Google Login */}
                  <button className="w-[235px] h-[35px] flex items-center justify-center gap-2 border border-gray-300 text-[#000000] rounded-full mb-4 ml-12  hover:shadow-md">
                      <img
                           src="https://www.svgrepo.com/show/355037/google.svg"
                           alt="Google"
                          className="w-5"
                      />Sign in with Google
                  </button>    
           </div>
      </div>
           
      
     
    </div>
  )
}
