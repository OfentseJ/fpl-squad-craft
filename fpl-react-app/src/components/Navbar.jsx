import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X, Activity, Users, TrendingUp, Star } from "lucide-react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const links = [
    {
      path: "/",
      label: "Home",
      icon: Users,
    },
    {
      path: "/planner",
      label: "Planner",
      icon: Star,
    },
    {
      path: "/trends",
      label: "Trends",
      icon: TrendingUp,
    },
    {
      path: "/live",
      label: "Live",
      icon: Activity,
    },
  ];

  return (
    <nav className="p-4 bg-green-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold flex items-center gap-2">
            <Activity className="text-green-200" />
            FPL Squad Craft
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-6">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex item-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    isActive ? "bg-green-600" : "hover:bg-green-600"
                  }`}
                >
                  <Icon size={18} />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    isActive ? "bg-green-600" : "hover:bg-green-600"
                  }`}
                >
                  <Icon size={18} />
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
