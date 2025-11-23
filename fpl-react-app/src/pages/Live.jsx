import { useState, useEffect } from "react";
import { useFPLApi } from "../hooks/useFPLApi";
import { getCurrentGameweek } from "../utils/gameweek";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ErrorDisplay from "../components/ErrorDisplay";

export default function Live({ data }) {
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getLive } = useFPLApi();

  const currentGW = getCurrentGameweek(data?.events);

  useEffect(() => {
    if (!currentGW?.id) return;

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
          .sort((a, b) => b.stats.total_points - a.stats.total_points)
          .slice(0, 20);

        setLiveData(merged);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [currentGW, data]);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorDisplay message={error} />;
  if (!liveData?.length) {
    return (
      <div className="p-12 text-center text-gray-600 dark:text-gray-400">
        No live data available for this gameweek
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Live Gameweek {currentGW?.id}</h2>

      <div className="space-y-3">
        {liveData.map((p) => (
          <div
            key={p.id}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          >
            <div>
              <h3 className="font-semibold text-lg">{p.info.web_name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {data.teams.find((t) => t.id === p.info.team)?.short_name}
              </p>
            </div>

            <div className="grid grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {p.stats.total_points}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Points
                </div>
              </div>
              <div>
                <div className="text-lg font-semibold">{p.stats.bps}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  BPS
                </div>
              </div>
              <div>
                <div className="text-lg font-semibold">
                  {p.stats.goals_scored || 0}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Goals
                </div>
              </div>
              <div>
                <div className="text-lg font-semibold">
                  {p.stats.assists || 0}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Assists
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
