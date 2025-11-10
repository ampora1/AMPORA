import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      className="fixed top-0 left-0 w-full bg-[#FFEDF3] shadow-md z-50 border-b border-[#ADEED9]"
      style={{ backdropFilter: "blur(10px)" }}
    >
      <div className="container mx-auto flex justify-between items-center px-6 py-4">
        {/* Logo */}
        <a
          href="/"
          className="text-2xl font-extrabold tracking-wide text-[#0ABAB5] hover:text-[#56DFCF] transition"
        >
          AMPORA ⚡
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-8 text-[#043D3A] font-medium">
          <a href="/" className="hover:text-[#0ABAB5] transition">Home</a>
          <a href="/trip-planner" className="hover:text-[#0ABAB5] transition">Trip Planner</a>
          <a href="/dashboard" className="hover:text-[#0ABAB5] transition">Dashboard</a>
          <a href="/login" className="hover:text-[#0ABAB5] transition">Login</a>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-[#043D3A] text-2xl focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#ADEED9] flex flex-col items-center py-6 space-y-4 text-[#043D3A] font-medium shadow-inner border-t border-[#56DFCF]/40 transition-all">
          <a href="/" className="hover:text-[#0ABAB5]" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="/trip-planner" className="hover:text-[#0ABAB5]" onClick={() => setMenuOpen(false)}>Trip Planner</a>
          <a href="/dashboard" className="hover:text-[#0ABAB5]" onClick={() => setMenuOpen(false)}>Dashboard</a>
          <a href="/login" className="hover:text-[#0ABAB5]" onClick={() => setMenuOpen(false)}>Login</a>
        </div>
      )}
    </nav>
  );
}
