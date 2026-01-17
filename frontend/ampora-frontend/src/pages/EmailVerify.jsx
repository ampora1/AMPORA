import React from 'react'

export default function EmailVerify() {
  return (
    <div className="min-h-screen w-screen flex  flex-row overflow-hidden p-4 justify-center bg-[#EDFEFF] fixed top-0 right-0 left-0">
      <div className="bg-white w-[380px] rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-center mb-4">
          Verify Your Account
        </h2>

        <form className="space-y-4">
          <input
            type="email"
            placeholder="Enter Your Email..."
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            
          />

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
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
