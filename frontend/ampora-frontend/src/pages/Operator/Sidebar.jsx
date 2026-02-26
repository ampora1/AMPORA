import { Cog6ToothIcon, CurrencyDollarIcon, DocumentTextIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/outline";
import { BoltIcon, HomeIcon, MapPinIcon } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import Logo from "../../assets/logo.png";

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  const nav = [
    [HomeIcon, "Overview", "/operator"],
    [MapPinIcon, "Stations", "/operator/stations"],
    [BoltIcon, "Booking", "/operator/bookings"],
    [CurrencyDollarIcon, "Payments", "/operator/payments"],
    [WrenchScrewdriverIcon, "Maintenance", "/operator/maintenance"],
    [DocumentTextIcon, "Reports", "/operator/reports"],
    [Cog6ToothIcon, "Settings", "/operator/settings"],
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed z-40 top-0 left-0  w-64 bg-black text-white px-6 py-5 transform transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:block`}
      >
        {/* LOGO */}
        <div className="flex items-center gap-3 mb-10">
          <img src={Logo} alt="Ampora Logo" className="w-10 h-10" />
          <span className="text-xl font-semibold tracking-widest">
            AMPORA
          </span>
        </div>

        {/* NAV */}
        <nav className="space-y-2">
          {nav.map(([Icon, label, path]) => {
            const active = location.pathname === path;

            return (
              <div
                key={label}
                onClick={() => {
                  navigate(path);
                  onClose?.(); // close on mobile
                }}
                className={`flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer transition
                  ${
                    active
                      ? "bg-white/10 text-white"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{label}</span>
              </div>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10 text-xs text-white/40">
          Ampora Operator Panel
        </div>
      </aside>
    </>
  );
}
