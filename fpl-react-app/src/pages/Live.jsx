import { useState, useEffect, useMemo } from "react";
import { getCurrentGameweek } from "../utils/FplUtils";
import LoadingSkeleton from "../components/Skeletons/LoadingSkeleton";
import ErrorDisplay from "../components/ErrorDisplay";
import Footer from "../components/Footer";
import { useFPLApi } from "../hooks/useFPLApi";
import { Trophy, Users, TrendingUp, Star } from "lucide-react";

export default function Live({ data }) {
  const [livePlayers, setLivePlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getLive } = useFPLApi();

  const currentGW = getCurrentGameweek(data?.events);

  useEffect(() => {
    if (!currentGW?.id || !data?.elements) return;

    setLoading(true);
    setError(null);

    getLive(currentGW.id)
      .then((live) => {
        // Merge Live stats with Static Info for ALL players
        const merged = Object.values(live.elements)
          .map((p) => ({
            ...p,
            info: data.elements.find((pl) => pl.id === p.id),
          }))
          .filter((p) => p.info) // Ensure data integrity
          .sort((a, b) => b.stats.total_points - a.stats.total_points);

        setLivePlayers(merged);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [currentGW?.id, data?.elements, getLive]);

  // --- WIDGET LOGIC ---
  const widgets = useMemo(() => {
    if (!livePlayers.length) return null;

    // 1. MVP (Highest Points)
    const mvp = livePlayers[0];

    // 2. Template Watch (Highest ownership > 20%, sorted by ownership)
    const template = livePlayers
      .filter((p) => parseFloat(p.info.selected_by_percent) > 20)
      .sort(
        (a, b) =>
          parseFloat(b.info.selected_by_percent) -
          parseFloat(a.info.selected_by_percent),
      )
      .slice(0, 3);

    // 3. Hidden Gems (Ownership < 10%, sorted by Points)
    const differentials = livePlayers
      .filter((p) => parseFloat(p.info.selected_by_percent) < 10)
      .slice(0, 3);

    return { mvp, template, differentials };
  }, [livePlayers]);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorDisplay message={error} />;

  // If no players have points yet (start of GW)
  if (!livePlayers?.length) {
    return (
      <div className="p-12 text-center text-gray-600 dark:text-gray-400">
        Waiting for Gameweek {currentGW?.id} to kick off...
      </div>
    );
  }

  return (
    <>
      <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-8">
        {/* HEADER */}
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            Live Gameweek {currentGW?.id}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Real-time stats and bonus points
          </p>
        </div>

        {/* --- WIDGETS GRID --- */}
        {widgets && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* WIDGET 1: MVP */}
            <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 dark:from-yellow-900/30 dark:to-gray-800 p-4 rounded-xl border border-yellow-200 dark:border-yellow-700/50 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start mb-2">
                <div className="bg-yellow-200 dark:bg-yellow-700 p-2 rounded-lg text-yellow-800 dark:text-yellow-100">
                  <Trophy size={20} />
                </div>
                <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400 uppercase tracking-wider">
                  GW MVP
                </span>
              </div>
              <div className="mt-2">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white truncate">
                  {widgets.mvp.info.web_name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {
                    data.teams.find((t) => t.id === widgets.mvp.info.team)
                      ?.short_name
                  }
                </p>
              </div>
              <div className="absolute bottom-4 right-4 text-4xl font-black text-yellow-600/20 dark:text-yellow-400/20 z-0">
                {widgets.mvp.stats.total_points}
              </div>
              <div className="relative z-10 mt-3 text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {widgets.mvp.stats.total_points}{" "}
                <span className="text-sm font-normal text-gray-500">pts</span>
              </div>
            </div>

            {/* WIDGET 2: TEMPLATE WATCH */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Users size={18} className="text-blue-500" />
                <h3 className="font-bold text-gray-700 dark:text-gray-200 text-sm uppercase">
                  Template Watch
                </h3>
              </div>
              <div className="space-y-3">
                {widgets.template.map((p) => (
                  <div
                    key={p.id}
                    className="flex justify-between items-center text-sm"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {p.info.web_name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {p.info.selected_by_percent}% owned
                      </span>
                    </div>
                    <div
                      className={`font-bold ${p.stats.total_points >= 5 ? "text-green-500" : "text-gray-500"}`}
                    >
                      {p.stats.total_points} pts
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* WIDGET 3: DIFFERENTIALS */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={18} className="text-purple-500" />
                <h3 className="font-bold text-gray-700 dark:text-gray-200 text-sm uppercase">
                  Top Differentials
                </h3>
              </div>
              <div className="space-y-3">
                {widgets.differentials.map((p) => (
                  <div
                    key={p.id}
                    className="flex justify-between items-center text-sm"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {p.info.web_name}
                      </span>
                      <span className="text-xs text-purple-500">
                        Only {p.info.selected_by_percent}%
                      </span>
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
        <div className="space-y-3">
          <h3 className="font-bold text-xl text-gray-800 dark:text-white">
            Top Scorers
          </h3>
          {livePlayers.slice(0, 50).map((p) => (
            <div
              key={p.id}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors hover:border-green-400 dark:hover:border-green-600"
            >
              <div className="flex items-center gap-3">
                {/* Rank Badge based on index would go here, simplified for now */}
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                    {p.info.web_name}
                    {p.stats.in_dreamteam && (
                      <Star
                        size={14}
                        className="text-yellow-400 fill-yellow-400"
                      />
                    )}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {data.teams.find((t) => t.id === p.info.team)?.short_name} •{" "}
                    {p.info.element_type === 1
                      ? "GKP"
                      : p.info.element_type === 2
                        ? "DEF"
                        : p.info.element_type === 3
                          ? "MID"
                          : "FWD"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 sm:gap-8 w-full sm:w-auto text-center">
                <div className="flex flex-col items-center">
                  <div className="text-2xl font-black text-green-600 dark:text-green-400">
                    {p.stats.total_points}
                  </div>
                  <div className="text-[10px] uppercase font-bold text-gray-400">
                    Pts
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <div className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                    {p.stats.bps}
                  </div>
                  <div className="text-[10px] uppercase font-bold text-gray-400">
                    BPS
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <div className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                    {p.stats.goals_scored}
                  </div>
                  <div className="text-[10px] uppercase font-bold text-gray-400">
                    Goal
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <div className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                    {p.stats.assists}
                  </div>
                  <div className="text-[10px] uppercase font-bold text-gray-400">
                    Ast
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}
