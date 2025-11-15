import React from 'react'

const Home = () => {
  return (
    <div className='flex flex-col w-screen  bg-[#EDFFFF]'>
      <div className='w-12/12  flex justify-center items-center mt-2'>

        <div className='w-5/12 h-[50vh] bg-[#2EC770] rounded-tl-[50px] rounded-bl-[50px] bg-[url(./assets/bg1.jpg)]'></div>
        <div className='w-5/12 h-[50vh] bg-[#D0FBE7] rounded-tr-[50px] rounded-br-[50px] '>
          <h2 className=' mt-5 font-bold text-black text-[50px] text-center'>POWER YOUR RV</h2>
          <div className='mt-5 w-12/12 flex justify-center items-center'>
            <input type="text" className='w-8/12  h-[50px] border-2 border-[#2EC770] rounded-[50px] bg-white' />
          </div>

          <div className=' mt-8 w-12/12 flex justify-center items-center'>
            <div className='w-2/12 border-5 border-[#2EC770] bg-white h-[100px]'></div>
            <div className=' ms-2 w-2/12 border-5 border-[#2EC770] bg-white h-[100px]'></div>
            <div className=' ms-2 w-2/12 border-5 border-[#2EC770] bg-white h-[100px]'></div>
          </div>

        </div>


      </div>

      <div className=' mt-8 w-12/12 flex justify-center items-center'>
        <div className='mx-2 w-2/12 rounded-2xl shadow-md/30  bg-white h-[200px] p-5 hover:shadow-2xl'>
          <h2 className='text-center mt-5 font-bold text-black text-[20px]'>FIND STATIONS</h2>
          <p className='text-center mt-2 font-medium text-black text-[15px]'>Locate EV charging stations along your route</p>

        </div>
        <div className='mx-2 w-2/12 rounded-2xl shadow-md/30  bg-white h-[200px] p-5 hover:shadow-2xl'>
          <h2 className='text-center mt-5 font-bold text-black text-[20px]'>FIND STATIONS</h2>
          <p className='text-center mt-2 font-medium text-black text-[15px]'>Locate EV charging stations along your route</p>

        </div>
        <div className='mx-2 w-2/12 rounded-2xl shadow-md/30  bg-white h-[200px] p-5 hover:shadow-2xl'>
          <h2 className='text-center mt-5 font-bold text-black text-[20px]'>FIND STATIONS</h2>
          <p className='text-center mt-2 font-medium text-black text-[15px]'>Locate EV charging stations along your route</p>

        </div>

      </div>

      <div className='w-12/12 flex justify-center items-center bg-[#D0FBE7] h-[200px] mt-5 '>
        <h2 className=' mt-5 font-bold text-black text-[30px] text-center'> Why you choose us</h2>
      </div>

      <div className=' mt-8 w-12/12 flex justify-center items-center'>
        <div className='mx-2 w-2/12 rounded-2xl shadow-md/30  bg-white h-[200px] p-5 hover:shadow-2xl'>
          <h2 className='text-center mt-5 font-bold text-black text-[20px]'>FIND STATIONS</h2>
          <p className='text-center mt-2 font-medium text-black text-[15px]'>Locate EV charging stations along your route</p>

        </div>
        <div className='mx-2 w-2/12 rounded-2xl shadow-md/30  bg-white h-[200px] p-5 hover:shadow-2xl'>
          <h2 className='text-center mt-5 font-bold text-black text-[20px]'>FIND STATIONS</h2>
          <p className='text-center mt-2 font-medium text-black text-[15px]'>Locate EV charging stations along your route</p>

        </div>
        <div className='mx-2 w-2/12 rounded-2xl shadow-md/30  bg-white h-[200px] p-5 hover:shadow-2xl'>
          <h2 className='text-center mt-5 font-bold text-black text-[20px]'>FIND STATIONS</h2>
          <p className='text-center mt-2 font-medium text-black text-[15px]'>Locate EV charging stations along your route</p>

        </div>

      </div>

      <div className='w-12/12  flex justify-center items-center mt-8'>

        <div className='w-5/12 h-[50vh] bg-[#F8F8F8] rounded-tl-[50px] rounded-bl-[50px] '>
          <h2 className=' mt-5 font-bold text-black text-[50px] text-center'>Power up your life</h2>
        </div>
        <div className='w-5/12 h-[50vh] bg-[#74FABD] rounded-tr-[50px] rounded-br-[50px] '>
         

        </div>


      </div>


    </div>


  )
}

export default Home