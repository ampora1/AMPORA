import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./Sidebar";
import { Bars3Icon } from "@heroicons/react/24/outline";

export default function OperatorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-white via-emerald-50 to-teal-100">

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Content */}
      <div className="flex-1 flex flex-col">

        {/* Top bar for mobile */}
        <header className="lg:hidden flex items-center px-4 py-3 bg-white shadow-sm">
          <button onClick={() => setSidebarOpen(true)}>
            <Bars3Icon className="w-6 h-6" />
          </button>
          <span className="ml-3 font-semibold">Operator Panel</span>
        </header>

        {/* Main */}
        <main className="p-4 sm:p-6 flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
