import React from "react";
import { motion } from "framer-motion";
import heroVideo from "../ev-video.mp4";

const fadeUp = {
  hidden: { opacity: 0, y: 25 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9 } },
};

const HeroSection = () => {
  return (
    <div className="relative mt-15 w-screen h-[92vh] overflow-hidden">

      {/* VIDEO */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={heroVideo} type="video/mp4" />
      </video>

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-black/65" />

      {/* CONTENT */}
      <div
        className="
          relative z-10 h-full
          flex flex-col justify-center
          px-5
          sm:px-10
          md:px-[10%]
          text-center
          md:text-left
        "
      >
        {/* TITLE */}
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="
            text-white font-extrabold leading-tight
            text-[34px]
            sm:text-[42px]
            md:text-[52px]
            lg:text-[65px]
          "
        >
          Power Your Journey
          <br />
          with Intelligence
        </motion.h1>

        {/* SUBTEXT */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.25 }}
          className="
            text-gray-200 mt-4
            text-sm
            sm:text-base
            md:text-xl
            max-w-xl
            mx-auto
            md:mx-0
          "
        >
          Discover EV charging stations, plan ultra-efficient routes,
          and experience the future of electric travel.
        </motion.p>

        {/* SEARCH */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.5 }}
          className="
            mt-8
            w-full
            max-w-md
            mx-auto
            md:mx-0
          "
        >
          <input
            type="text"
            placeholder="Search EV chargers or locations…"
            className="
              w-full h-[52px]
              px-6 rounded-full
              bg-white/95 backdrop-blur
              text-black
              text-sm sm:text-base
              outline-none
              focus:ring-4 focus:ring-emerald-400
              shadow-xl
            "
          />
        </motion.div>

        {/* ELECTRICITY BARS */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.8 }}
          className="
            flex gap-3 mt-10
            justify-center
            md:justify-start
          "
        >
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{ height: ["40px", "70px", "40px"] }}
              transition={{
                repeat: Infinity,
                duration: 1.4,
                delay: i * 0.2,
              }}
              className="w-4 bg-emerald-400 rounded-md shadow-lg"
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
