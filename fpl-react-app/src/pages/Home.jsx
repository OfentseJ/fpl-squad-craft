import { useState, useEffect } from "react";
import {
  TrendingUp,
  Activity,
  Star,
  ArrowRight,
  Calendar,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getCurrentGameweek } from "../utils/FplUtils";
import Footer from "../components/Footer";
import HomeSkeleton from "../components/Skeletons/HomeSkeleton";

export default function Home({ data }) {
  const currentGW = getCurrentGameweek(data?.events);
  const nextGW = data?.events?.find((e) => e.is_next);

  // Countdown State
  const [hoursLeft, setHoursLeft] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ minutes: 0, seconds: 0 });

  // Countdown Logic
  useEffect(() => {
    if (!nextGW?.deadline_time) return;

    const calculateTime = () => {
      const difference = new Date(nextGW.deadline_time) - new Date();

      if (difference > 0) {
        // Calculate Total Hours (not just hours in a day)
        const totalHours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setHoursLeft(totalHours);
        setTimeLeft({ minutes, seconds });
      } else {
        setHoursLeft(0);
        setTimeLeft({ minutes: 0, seconds: 0 });
      }
    };

    // Initial call to avoid 1-second delay
    calculateTime();

    // Update every second
    const timer = setInterval(calculateTime, 1000);

    return () => clearInterval(timer);
  }, [nextGW]);

  const features = [
    {
      to: "/planner",
      title: "Squad Planner",
      desc: "Build your perfect team with future gameweek planning.",
      icon: Star,
      color: "text-yellow-500",
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
    },
    {
      to: "/trends",
      title: "Transfer Trends",
      desc: "Analyze market moves. See who is hot and who is not.",
      icon: TrendingUp,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      to: "/live",
      title: "Live Stats",
      desc: "Track real-time bonus points and match performance.",
      icon: Activity,
      color: "text-green-500",
      bg: "bg-green-50 dark:bg-green-900/20",
    },
  ];

  // Helper to pad numbers (e.g., 5 -> 05)
  const pad = (num) => String(num).padStart(2, "0");

  if (!data || !data.events) {
    return <HomeSkeleton />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Section */}
      <div className="bg-linear-to-br from-green-600 to-emerald-900 text-white py-12 sm:py-20 px-6 text-center shadow-lg relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div
          className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        ></div>

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* THE BIG COUNTDOWN CLOCK */}
          {hoursLeft !== null && (
            <div className="mb-10 inline-flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="text-green-300 text-xs font-bold uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                <Clock size={14} /> Deadline: Gameweek {nextGW?.id}
              </span>

              <div className="flex items-baseline gap-2 sm:gap-4 font-mono text-5xl sm:text-7xl font-black drop-shadow-xl bg-white/10 px-6 py-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                <div className="flex flex-col items-center">
                  <span>{pad(hoursLeft)}</span>
                </div>
                <span className="text-green-400/50 text-3xl sm:text-5xl -translate-y-2">
                  :
                </span>
                <div className="flex flex-col items-center">
                  <span>{pad(timeLeft.minutes)}</span>
                </div>
                <span className="text-green-400/50 text-3xl sm:text-5xl -translate-y-2">
                  :
                </span>
                <div className="flex flex-col items-center">
                  <span>{pad(timeLeft.seconds)}</span>
                </div>
              </div>

              <div className="flex w-full justify-between px-8 sm:px-12 mt-2 text-[10px] sm:text-xs font-bold text-green-200/70 uppercase tracking-widest">
                <span>Hours</span>
                <span>Mins</span>
                <span>Secs</span>
              </div>
            </div>
          )}

          <h2 className="text-3xl sm:text-5xl font-black mb-6 tracking-tight drop-shadow-sm">
            Master Your FPL Season
          </h2>
          <p className="text-lg sm:text-xl text-green-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            Advanced statistics, live match data, and a powerful squad planner
            to help you climb the ranks.
          </p>

          <Link
            to="/planner"
            className="inline-flex items-center gap-2 bg-white text-green-800 px-8 py-3 rounded-full font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200"
          >
            Start Planning <ArrowRight size={20} />
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="grow max-w-6xl mx-auto px-4 sm:px-6 -mt-10 relative z-20 pb-12">
        {/* Status Banner */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-4 sm:p-6 mb-10 border border-gray-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
          {/* Left: Current Status Info */}
          <div className="flex items-center gap-4">
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl text-green-600 dark:text-green-400">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Current Status
              </p>
              <div className="flex items-center gap-3">
                <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                  Gameweek {currentGW?.id || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Live Badge (only if active) */}
          {currentGW?.is_current && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 animate-pulse font-bold text-xs sm:text-sm tracking-wide">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              MATCHES LIVE
            </div>
          )}
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <Link
                key={i}
                to={feature.to}
                className="group bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md hover:shadow-xl border border-gray-100 dark:border-slate-700 transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors ${feature.bg}`}
                >
                  <Icon className={feature.color} size={28} />
                </div>
                <h4 className="font-bold text-xl mb-2 text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                  {feature.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      <Footer />
    </div>
  );
}
