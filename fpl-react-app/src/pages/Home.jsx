import { useState, useEffect } from "react"; // 1. Import Hooks
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

  // 2. Find specifically the NEXT gameweek for the deadline
  // (currentGW might be the 'active' one, but we want the deadline of the upcoming one)
  const nextGW = data?.events?.find((e) => e.is_next);

  // 3. Countdown State
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // 4. Countdown Logic
  useEffect(() => {
    if (!nextGW?.deadline_time) return;

    const calculateTimeLeft = () => {
      const difference = +new Date(nextGW.deadline_time) - +new Date();

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    // Initial call
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

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

  // Helper to pad numbers (e.g., 05 instead of 5)
  const pad = (num) => String(num).padStart(2, "0");

  if (!data || !data.events) {
    return <HomeSkeleton />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Section */}
      <div className="bg-linear-to-br from-green-600 to-emerald-900 text-white py-16 sm:py-24 px-6 text-center shadow-lg relative overflow-hidden">
        <div
          className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        ></div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-black mb-6 tracking-tight drop-shadow-sm">
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
        {currentGW && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-1 mb-10 border border-gray-100 dark:border-slate-700">
            <div className="bg-slate-900 text-white p-6 rounded-xl flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

              {/* Left Side: GW Title */}
              <div className="flex items-center gap-4 z-10 w-full md:w-auto">
                <div className="bg-green-500 p-3 rounded-lg text-slate-900 shrink-0">
                  <Calendar size={28} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                    Current Status
                  </h3>
                  <div className="text-2xl font-black whitespace-nowrap">
                    Gameweek {currentGW.id}
                  </div>
                </div>
              </div>

              {/* Right Side: Countdown or Live Badge */}
              <div className="z-10 w-full md:w-auto flex justify-center md:justify-end">
                {currentGW.is_current ? (
                  // If Currently Playing: Show LIVE badge
                  <div className="px-6 py-3 rounded-full bg-green-500/20 text-green-400 border border-green-500/50 animate-pulse font-black tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    LIVE NOW
                  </div>
                ) : nextGW ? (
                  // If Not Playing: Show Countdown to Next GW
                  <div className="flex flex-col items-end">
                    <div className="text-xs text-gray-400 uppercase font-bold mb-1 flex items-center gap-1">
                      <Clock size={12} /> Deadline: GW{nextGW.id}
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 text-center">
                      {[
                        { label: "D", value: timeLeft.days },
                        { label: "H", value: timeLeft.hours },
                        { label: "M", value: timeLeft.minutes },
                        { label: "S", value: timeLeft.seconds },
                      ].map((item, idx) => (
                        <div key={idx} className="flex flex-col">
                          <div className="bg-slate-800 border border-slate-700 w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center text-xl sm:text-2xl font-mono font-bold text-white shadow-inner">
                            {pad(item.value)}
                          </div>
                          <span className="text-[10px] text-gray-500 font-bold mt-1">
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  // End of Season Fallback
                  <div className="text-gray-400 font-bold">
                    Season Completed
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

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
