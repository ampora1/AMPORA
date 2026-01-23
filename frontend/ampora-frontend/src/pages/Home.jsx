import React from "react";
import { motion } from "framer-motion";
import icon1 from "../assets/battery1.png";
import roadtrip from "../assets/one-way-trip.png";
import mark from "../assets/location.png";
import HeroSection from "../components/UI/HeroSection";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const Home = () => {
  return (
    <div className="w-full min-h-screen bg-[#EDFFFF] overflow-x-hidden">

      {/* HERO */}
      <HeroSection />

      {/* DIVIDER */}
      <div className="relative w-full flex justify-center mt-10">
        <div className="electric-line" />
      </div>

      {/* FEATURES */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="mt-16 flex flex-col lg:flex-row justify-center gap-6 px-4 sm:px-8 lg:px-16"
      >
        {[
          { title: "Find Stations", img: mark },
          { title: "Plan Trip", img: roadtrip },
          { title: "Smart Routing", img: icon1 },
        ].map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05, y: -6 }}
            className="w-full lg:w-1/4 bg-white shadow-lg rounded-2xl p-6
                       flex flex-col items-center justify-center
                       hover:shadow-2xl transition"
          >
            <h3 className="font-bold text-lg sm:text-xl text-gray-800">
              {item.title}
            </h3>
            <img
              src={item.img}
              alt={item.title}
              className="w-16 h-16 sm:w-20 sm:h-20 mt-4"
            />
          </motion.div>
        ))}
      </motion.div>

      {/* WHY AMPORA */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="w-full mt-24 bg-[#D0FBE7] py-14 px-4"
      >
        <h2 className="text-2xl sm:text-3xl lg:text-[38px]
                       font-extrabold text-gray-900 text-center">
          Why You Should Choose Ampora ⚡
        </h2>
      </motion.div>

      {/* STATS */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="flex flex-col sm:flex-row flex-wrap
                   justify-center gap-6 mt-12
                   px-4 sm:px-8 lg:px-16"
      >
        {[
          { num: "150+", label: "Active Charging Stations" },
          { num: "99%", label: "Uptime Availability" },
          { num: "50k+", label: "Trips Optimized" },
        ].map((i, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.06 }}
            className="w-full sm:w-[280px] bg-white p-6 sm:p-8
                       shadow-xl rounded-2xl
                       flex flex-col items-center justify-center"
          >
            <h1 className="text-4xl sm:text-5xl font-extrabold text-emerald-500">
              {i.num}
            </h1>
            <p className="text-gray-700 mt-2 text-sm text-center">
              {i.label}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* INFO CARDS */}
      <div className="flex flex-col lg:flex-row justify-center
                      mt-20 gap-6 px-4 sm:px-8 lg:px-16 mb-20">

        {/* CARD 1 */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="w-full lg:w-5/12 bg-[#F8F8F8]
                     rounded-3xl shadow-xl p-6 sm:p-8"
        >
          <h2 className="text-2xl sm:text-[32px] font-bold text-gray-800">
            Power Up Your Life
          </h2>

          <div className="flex flex-col sm:flex-row items-center mt-6 gap-4">
            <img src={icon1} className="w-24 h-24 sm:w-32 sm:h-32" />

            <div className="flex flex-col text-center sm:text-left">
              <h3 className="text-lg sm:text-xl font-semibold">
                Lightning Fast Charging
              </h3>
              <p className="text-gray-600 mt-2 text-sm">
                Experience ultra-fast charging to keep your EV running.
              </p>
              <button
                className="mt-4 px-6 py-2 bg-white border-2
                           border-emerald-400 rounded-xl
                           hover:shadow-lg transition self-center sm:self-start"
              >
                See Chargers
              </button>
            </div>
          </div>
        </motion.div>

        {/* CARD 2 */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="w-full lg:w-5/12 bg-[#A0F5CD]
                     rounded-3xl shadow-xl p-6 sm:p-8"
        >
          <h2 className="text-2xl sm:text-[32px] font-bold text-gray-800">
            Effortless Trip Planning
          </h2>

          <div className="flex flex-col sm:flex-row items-center mt-6 gap-4">
            <img src={roadtrip} className="w-24 h-24 sm:w-32 sm:h-32" />

            <div className="flex flex-col text-center sm:text-left">
              <h3 className="text-lg sm:text-xl font-semibold">
                Smart Route Optimization
              </h3>
              <p className="text-gray-700 mt-2 text-sm">
                Plan the most efficient route with live station data.
              </p>
              <button
                onClick={() => (window.location.href = "/trip")}
                className="mt-4 px-6 py-2 bg-white border-2
                           border-emerald-400 rounded-xl
                           hover:shadow-lg transition self-center sm:self-start"
              >
                Plan Trip
              </button>
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  );
};

export default Home;
