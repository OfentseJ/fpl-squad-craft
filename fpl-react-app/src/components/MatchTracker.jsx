import { Activity } from "lucide-react";
import { useFPLApi } from "../hooks/useFPLApi";

export default function MatchTracker({ fixtures, teams, gameweekId }) {
  // Get the badge helper from your custom hook
  const { getTeamBadgeUrl } = useFPLApi();

  // Helper to find team data by ID
  const getTeam = (id) => teams?.find((t) => t.id === id);

  // Filter fixtures for the specific Gameweek
  const currentFixtures = fixtures
    ? fixtures.filter((f) => f.event === gameweekId)
    : [];

  if (!currentFixtures.length) return null;

  return (
    <div className="bg-gray-50 dark:bg-slate-800/50 p-4 sm:p-6 border-t border-gray-100 dark:border-slate-700">
      <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
        <Activity size={14} /> Live & Recent Results
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {currentFixtures.map((fixture) => {
          const homeTeam = getTeam(fixture.team_h);
          const awayTeam = getTeam(fixture.team_a);
          const isLive = fixture.started && !fixture.finished;
          const isFinished = fixture.finished;
          const notStarted = !fixture.started;

          // Format Time (e.g. 15:00)
          const kickoff = new Date(fixture.kickoff_time).toLocaleTimeString(
            [],
            { hour: "2-digit", minute: "2-digit" },
          );

          return (
            <div
              key={fixture.id}
              className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-3 flex flex-col justify-center shadow-sm relative overflow-hidden transition-all hover:shadow-md"
            >
              {/* Live Indicator Strip */}
              {isLive && (
                <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
              )}

              <div className="flex justify-between items-center mb-2">
                {/* Home Team */}
                <div className="flex items-center gap-2 w-1/3 overflow-hidden">
                  {/* Badge */}
                  <img
                    src={getTeamBadgeUrl(homeTeam?.code)}
                    alt={homeTeam?.short_name}
                    className="w-6 h-6 object-contain"
                    loading="lazy"
                  />
                  <span
                    className="font-bold text-sm text-gray-900 dark:text-gray-200 truncate"
                    title={homeTeam?.name}
                  >
                    {homeTeam?.short_name || "Home"}
                  </span>
                </div>

                {/* Score / Time */}
                <div className="w-1/3 text-center shrink-0">
                  {notStarted ? (
                    <span className="text-xs font-mono text-gray-400 bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded inline-flex items-center gap-1">
                      {kickoff}
                    </span>
                  ) : (
                    <div
                      className={`font-black text-lg tracking-widest ${
                        isLive
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-800 dark:text-white"
                      }`}
                    >
                      {fixture.team_h_score} - {fixture.team_a_score}
                    </div>
                  )}
                </div>

                {/* Away Team */}
                <div className="flex items-center justify-end gap-2 w-1/3 overflow-hidden">
                  <span
                    className="font-bold text-sm text-gray-900 dark:text-gray-200 truncate"
                    title={awayTeam?.name}
                  >
                    {awayTeam?.short_name || "Away"}
                  </span>
                  {/* Badge */}
                  <img
                    src={getTeamBadgeUrl(awayTeam?.code)}
                    alt={awayTeam?.short_name}
                    className="w-6 h-6 object-contain"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Status Footer */}
              <div className="text-center">
                {isLive && (
                  <span className="text-[10px] uppercase font-bold text-green-600 animate-pulse">
                    Playing
                  </span>
                )}
                {isFinished && (
                  <span className="text-[10px] uppercase font-bold text-gray-400">
                    FT
                  </span>
                )}
                {notStarted && (
                  <span className="text-[10px] uppercase font-bold text-gray-400">
                    Upcoming
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
