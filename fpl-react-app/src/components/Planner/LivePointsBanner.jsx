import { Trophy, Users } from "lucide-react";
import { useMemo } from "react";

export default function LivePointsBanner({ squad, liveStats, gameweekId }) {
  // Calculate Totals
  const { totalPoints, benchPoints, playersPlayed } = useMemo(() => {
    let total = 0;
    let bench = 0;
    let playedCount = 0;

    if (
      !squad ||
      squad.length === 0 ||
      !liveStats ||
      Object.keys(liveStats).length === 0
    ) {
      return { totalPoints: 0, benchPoints: 0, playersPlayed: 0 };
    }

    // 1. Calculate Starters (Indices 0-10)
    squad.slice(0, 11).forEach((player) => {
      const stats = liveStats[player.id];
      if (stats) {
        let pts = stats.total_points;

        // Captain Logic (Simple x2)
        if (player.is_captain) pts *= 2;
        // (Triple Captain check would go here if/when added)

        total += pts;

        // Count as "Played" if minutes > 0
        if (stats.minutes > 0) playedCount++;
      }
    });

    // 2. Calculate Bench (Indices 11-14)
    squad.slice(11, 15).forEach((player) => {
      const stats = liveStats[player.id];
      if (stats) {
        bench += stats.total_points;
      }
    });

    return {
      totalPoints: total,
      benchPoints: bench,
      playersPlayed: playedCount,
    };
  }, [squad, liveStats]);

  // If no live stats exist (e.g. future gameweek), don't render anything
  if (!liveStats || Object.keys(liveStats).length === 0) return null;

  return (
    <div className="w-full max-w-md sm:max-w-xl md:max-w-3xl mx-auto mb-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-3 flex justify-between items-center">
        {/* Left: Total Score */}
        <div className="flex items-center gap-3">
          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg text-green-600 dark:text-green-400">
            <Trophy size={20} />
          </div>
          <div>
            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
              GW{gameweekId} Points
            </div>
            <div className="text-2xl font-black text-gray-900 dark:text-white leading-none">
              {totalPoints}
            </div>
          </div>
        </div>

        {/* Right: Meta Info */}
        <div className="flex gap-4 text-right">
          {/* Players Played Count */}
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1 text-[10px] text-gray-400 uppercase font-bold">
              Played
            </div>
            <div className="font-bold text-gray-700 dark:text-gray-200">
              {playersPlayed} / 11
            </div>
          </div>

          {/* Bench Points */}
          <div className="flex flex-col items-end border-l pl-4 border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-1 text-[10px] text-gray-400 uppercase font-bold">
              Bench
            </div>
            <div className="font-bold text-gray-500 dark:text-gray-400">
              {benchPoints} pts
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
