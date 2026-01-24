import { useState, useEffect, useMemo } from "react";
import { getCurrentGameweek } from "../utils/FplUtils";
import LoadingSkeleton from "../components/Skeletons/LoadingSkeleton";
import ErrorDisplay from "../components/ErrorDisplay";
import Footer from "../components/Footer";
import { useFPLApi } from "../hooks/useFPLApi";
import { Trophy, Users, TrendingUp, Star, AlertCircle } from "lucide-react";
import LiveSkeleton from "../components/Skeletons/LiveSkeleton";

export default function Live({ data }) {
  const [livePlayers, setLivePlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Destructure getPlayerImageUrl from your hook
  const { getLive, getPlayerImageUrl } = useFPLApi();

  const currentGW = getCurrentGameweek(data?.events);

  useEffect(() => {
    if (!currentGW?.id || !data?.elements) return;

    setLoading(true);
    setError(null);

    getLive(currentGW.id)
      .then((live) => {
        const merged = Object.values(live.elements)
          .map((p) => ({
            ...p,
            info: data.elements.find((pl) => pl.id === p.id),
          }))
          .filter((p) => p.info)
          .sort((a, b) => b.stats.total_points - a.stats.total_points);

        setLivePlayers(merged);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [currentGW?.id, data?.elements, getLive]);

  const widgets = useMemo(() => {
    if (!livePlayers.length) return null;

    const mvp = livePlayers[0];

    const template = livePlayers
      .filter((p) => parseFloat(p.info.selected_by_percent) > 20)
      .sort(
        (a, b) =>
          parseFloat(b.info.selected_by_percent) -
          parseFloat(a.info.selected_by_percent),
      )
      .slice(0, 3);

    const differentials = livePlayers
      .filter((p) => parseFloat(p.info.selected_by_percent) < 10)
      .sort((a, b) => b.stats.total_points - a.stats.total_points)
      .slice(0, 3);

    return { mvp, template, differentials };
  }, [livePlayers]);

  if (loading) return <LiveSkeleton />;
  if (error) return <ErrorDisplay message={error} />;

  if (!livePlayers?.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-500">
        <AlertCircle size={48} className="mb-4 text-gray-300" />
        <p>Waiting for Gameweek {currentGW?.id} data...</p>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-8 min-h-screen">
        {/* HEADER */}
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <span className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
            </span>
            Live Gameweek {currentGW?.id}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 ml-7">
            Real-time points, bonus systems, and stats.
          </p>
        </div>

        {/* --- WIDGETS GRID --- */}
        {widgets && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* WIDGET 1: MVP */}
            <div className="bg-linear-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-5 rounded-2xl border border-yellow-200 dark:border-yellow-700/50 shadow-sm relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="bg-yellow-100 dark:bg-yellow-900/50 p-2 rounded-lg text-yellow-700 dark:text-yellow-400">
                  <Trophy size={20} />
                </div>
                <span className="text-[10px] font-bold text-yellow-800 dark:text-yellow-300 uppercase tracking-widest">
                  GW MVP
                </span>
              </div>

              <div className="flex items-end gap-4 relative z-10">
                {/* MVP Image */}
                <div className="w-20 h-24 overflow-hidden rounded-lg bg-yellow-200/50">
                  <img
                    src={getPlayerImageUrl(widgets.mvp.info.code)}
                    alt={widgets.mvp.info.web_name}
                    className="w-full h-full object-cover object-top"
                    loading="lazy"
                  />
                </div>

                <div className="pb-1">
                  <h3 className="text-xl font-black text-gray-900 dark:text-white truncate max-w-30">
                    {widgets.mvp.info.web_name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-yellow-600 dark:text-yellow-400">
                      {widgets.mvp.stats.total_points}
                    </span>
                    <span className="text-sm font-bold text-gray-400 uppercase">
                      Pts
                    </span>
                  </div>
                </div>
              </div>

              {/* Background Deco */}
              <div className="absolute -bottom-6 -right-6 text-yellow-500/10 dark:text-yellow-500/5 transform rotate-12 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                <Trophy size={140} />
              </div>
            </div>

            {/* WIDGET 2: TEMPLATE WATCH */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md text-blue-600 dark:text-blue-400">
                  <Users size={16} />
                </div>
                <h3 className="font-bold text-gray-700 dark:text-gray-200 text-xs uppercase tracking-wider">
                  Template Watch
                </h3>
              </div>
              <div className="space-y-3 flex-1">
                {widgets.template.map((p) => (
                  <div
                    key={p.id}
                    className="flex justify-between items-center text-sm border-b border-gray-50 dark:border-gray-700/50 last:border-0 pb-2 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      {/* Small Round Image */}
                      <img
                        src={getPlayerImageUrl(p.info.code)}
                        alt={p.info.web_name}
                        className="w-8 h-8 rounded-full bg-gray-100 object-cover object-top"
                        loading="lazy"
                      />
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800 dark:text-gray-200">
                          {p.info.web_name}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {p.info.selected_by_percent}% Owned
                        </span>
                      </div>
                    </div>
                    <div
                      className={`font-bold ${
                        p.stats.total_points >= 5
                          ? "text-green-500"
                          : "text-gray-500"
                      }`}
                    >
                      {p.stats.total_points} pts
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* WIDGET 3: DIFFERENTIALS */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-md text-purple-600 dark:text-purple-400">
                  <TrendingUp size={16} />
                </div>
                <h3 className="font-bold text-gray-700 dark:text-gray-200 text-xs uppercase tracking-wider">
                  Top Differentials
                </h3>
              </div>
              <div className="space-y-3 flex-1">
                {widgets.differentials.map((p) => (
                  <div
                    key={p.id}
                    className="flex justify-between items-center text-sm border-b border-gray-50 dark:border-gray-700/50 last:border-0 pb-2 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      {/* Small Round Image */}
                      <img
                        src={getPlayerImageUrl(p.info.code)}
                        alt={p.info.web_name}
                        className="w-8 h-8 rounded-full bg-gray-100 object-cover object-top"
                        loading="lazy"
                      />
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800 dark:text-gray-200">
                          {p.info.web_name}
                        </span>
                        <span className="text-[10px] text-purple-500 font-medium">
                          Only {p.info.selected_by_percent}%
                        </span>
                      </div>
                    </div>
                    <div className="font-bold text-green-500">
                      {p.stats.total_points} pts
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- MAIN PLAYER LIST --- */}
        <div className="space-y-4">
          <div className="flex justify-between items-end border-b border-gray-200 dark:border-gray-700 pb-2">
            <h3 className="font-bold text-xl text-gray-800 dark:text-white">
              Top Scorers
            </h3>
            <span className="text-xs text-gray-500">Showing top 50</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {livePlayers.slice(0, 50).map((p, index) => (
              <div
                key={p.id}
                className="group p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:shadow-md hover:border-green-500/30"
              >
                {/* Player Info */}
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-bold text-gray-400">
                    {index + 1}
                  </div>

                  {/* Player Image - Main List */}
                  <div className="w-12 h-12 bg-gray-50 dark:bg-gray-700 rounded-full overflow-hidden shrink-0 border border-gray-200 dark:border-gray-600">
                    <img
                      src={getPlayerImageUrl(p.info.code)}
                      alt={p.info.web_name}
                      className="w-full h-full object-cover object-top"
                      loading="lazy"
                    />
                  </div>

                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                      {p.info.web_name}
                      {p.stats.in_dreamteam && (
                        <Star
                          size={16}
                          className="text-yellow-400 fill-yellow-400"
                        />
                      )}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">
                        {
                          data.teams.find((t) => t.id === p.info.team)
                            ?.short_name
                        }
                      </span>
                      <span>•</span>
                      <span>
                        {p.info.element_type === 1
                          ? "GKP"
                          : p.info.element_type === 2
                            ? "DEF"
                            : p.info.element_type === 3
                              ? "MID"
                              : "FWD"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-2 sm:gap-6 w-full sm:w-auto text-center bg-gray-50 dark:bg-gray-900/50 p-3 sm:p-0 rounded-lg sm:bg-transparent sm:dark:bg-transparent">
                  <div className="flex flex-col items-center">
                    <div className="text-2xl font-black text-green-600 dark:text-green-400 leading-none">
                      {p.stats.total_points}
                    </div>
                    <div className="text-[9px] uppercase font-bold text-gray-400 mt-1">
                      Pts
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-lg font-semibold text-gray-700 dark:text-gray-300 leading-none">
                      {p.stats.bps}
                    </div>
                    <div className="text-[9px] uppercase font-bold text-gray-400 mt-1">
                      BPS
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-lg font-semibold text-gray-700 dark:text-gray-300 leading-none">
                      {p.stats.goals_scored}
                    </div>
                    <div className="text-[9px] uppercase font-bold text-gray-400 mt-1">
                      Goal
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-lg font-semibold text-gray-700 dark:text-gray-300 leading-none">
                      {p.stats.assists}
                    </div>
                    <div className="text-[9px] uppercase font-bold text-gray-400 mt-1">
                      Ast
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
