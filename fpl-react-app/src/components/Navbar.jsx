import { Link, useLocation } from "react-router-dom";
import { useState, useContext } from "react";
import {
  Menu,
  X,
  Activity,
  Users,
  TrendingUp,
  Star,
  Sun,
  Moon,
} from "lucide-react";
import { DarkModeContext } from "../context/DarkModeContext";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { dark, setDark } = useContext(DarkModeContext);

  const links = [
    { path: "/", label: "Home", icon: Users },
    { path: "/planner", label: "Planner", icon: Star },
    { path: "/trends", label: "Trends", icon: TrendingUp },
    { path: "/live", label: "Live", icon: Activity },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-green-700/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-green-600 dark:border-slate-800 text-white shadow-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Area */}
          <Link
            to="/"
            className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2 hover:opacity-90 transition-opacity"
            onClick={() => setMobileOpen(false)}
          >
            <div className="bg-white/10 p-1.5 rounded-lg border border-white/20">
              <Activity className="text-green-300" size={24} />
            </div>
            <span>
              FPL <span className="text-green-300">Squad</span> Craft
            </span>
          </Link>

          {/* Desktop Nav & Actions */}
          <div className="hidden md:flex items-center space-x-2">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                    isActive
                      ? "bg-white text-green-800 shadow-sm scale-105"
                      : "text-green-100 hover:bg-green-600 hover:text-white"
                  }`}
                >
                  <Icon size={16} strokeWidth={isActive ? 3 : 2} />
                  {link.label}
                </Link>
              );
            })}

            {/* Divider */}
            <div className="h-6 w-px bg-green-600/50 mx-2" />

            {/* Dark Mode Toggle (Integrated) */}
            <button
              onClick={() => setDark(!dark)}
              className="p-2 rounded-full bg-green-800/50 hover:bg-green-800 text-green-100 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-4 md:hidden">
            <button
              onClick={() => setDark(!dark)}
              className="p-2 text-green-100"
            >
              {dark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-green-800 dark:bg-slate-900 border-t border-green-700 dark:border-slate-800">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                    isActive
                      ? "bg-white text-green-900 shadow-md"
                      : "text-green-100 hover:bg-green-700/50"
                  }`}
                >
                  <Icon size={20} />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
