import { useState } from "react";
import { X, ArrowLeftRight, CalendarDays } from "lucide-react";
import { useFPLApi } from "../../hooks/useFPLApi";

export default function PlayerDetailModal({
  player,
  squad,
  fixtures,
  onClose,
  onRemove,
  onSubstitute,
  isSquadView = true,
  onAdd,
}) {
  const [substituting, setSubstituting] = useState(false);
  const { getPlayerImageUrl, getTeamBadgeUrl } = useFPLApi();
  const positionMap = {
    1: "Goalkeeper",
    2: "Defender",
    3: "Midfielder",
    4: "Forward",
  };
  const team = player.teams?.find((t) => t.id === player.team);

  // Filter eligible subs (same position, different player)
  const eligibleSubs = squad.filter(
    (p) => p.element_type === player.element_type && p.id !== player.id
  );

  // --- Fixture Logic ---
  const getNextFixtures = () => {
    if (!fixtures || fixtures.length === 0) return [];

    // Filter fixtures for this player's team that haven't finished
    const teamFixtures = fixtures.filter(
      (f) =>
        (f.team_h === player.team || f.team_a === player.team) && !f.finished
    );

    // Sort by gameweek (event) and take next 4
    return teamFixtures
      .sort((a, b) => a.event - b.event)
      .slice(0, 4)
      .map((f) => {
        const isHome = f.team_h === player.team;
        const opponentId = isHome ? f.team_a : f.team_h;
        // Find opponent short name from player.teams array if available
        const opponent = player.teams?.find((t) => t.id === opponentId);
        const difficulty = isHome ? f.team_h_difficulty : f.team_a_difficulty;
        const badge = getTeamBadgeUrl(opponent?.code);

        return {
          event: f.event,
          opponent: opponent?.short_name || "OPP",
          isHome,
          difficulty,
          badge,
        };
      });
  };

  const nextFixtures = getNextFixtures();

  // Difficulty Color Helper
  const getFDRColor = (difficulty) => {
    if (difficulty <= 2) return "bg-green-500";
    if (difficulty === 3) return "bg-gray-400";
    if (difficulty === 4) return "bg-red-500";
    return "bg-red-800";
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white dark:bg-gray-900 shadow-2xl z-50 overflow-y-auto animate-slideInRight flex flex-col">
        {/* Colorful Header */}
        <div className="relative h-48 bg-linear-to-br from-purple-700 to-indigo-900 overflow-hidden shrink-0">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-white to-transparent"></div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-all"
          >
            <X size={20} />
          </button>

          {/* Player Image (Bottom Left) */}
          <div className="absolute bottom-0 left-6 flex items-end translate-y-2 z-10">
            <img
              src={getPlayerImageUrl(player.code)}
              alt={player.web_name}
              className="w-32 h-32 object-contain drop-shadow-2xl"
              onError={(e) => (e.target.style.display = "none")}
            />
          </div>

          {/* Text Info (Bottom Right) */}
          <div className="absolute bottom-4 right-6 text-right text-white z-10 flex flex-col items-end">
            {/* Team Badge (Small, Top of name) */}
            <img
              src={getTeamBadgeUrl(team?.code)}
              alt="Badge"
              className="w-10 h-10 object-contain drop-shadow-lg opacity-90 mb-1"
            />
            <h2 className="text-2xl font-bold leading-none">
              {player.web_name}
            </h2>
            <div className="text-sm opacity-80 font-medium mt-1">
              {positionMap[player.element_type]}
            </div>
            <div className="text-xs opacity-60 uppercase tracking-wider">
              {team?.name}
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="px-6 pt-6 flex-1 overflow-y-auto">
          {/* Key Stats Row */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-center border border-gray-100 dark:border-gray-700">
              <div className="text-xs text-gray-500 uppercase font-bold">
                Price
              </div>
              <div className="text-lg font-black text-gray-800 dark:text-white">
                £{(player.now_cost / 10).toFixed(1)}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-center border border-gray-100 dark:border-gray-700">
              <div className="text-xs text-gray-500 uppercase font-bold">
                Points
              </div>
              <div className="text-lg font-black text-green-600">
                {player.total_points}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-center border border-gray-100 dark:border-gray-700">
              <div className="text-xs text-gray-500 uppercase font-bold">
                Selected
              </div>
              <div className="text-lg font-black text-blue-500">
                {player.selected_by_percent}%
              </div>
            </div>
          </div>

          {/* Fixture Ticker */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <CalendarDays size={16} /> Next Fixtures
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {nextFixtures.length > 0 ? (
                nextFixtures.map((fix) => (
                  <div
                    key={fix.event}
                    className="flex-1 min-w-[70px] flex flex-col items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                  >
                    <div className="text-[10px] text-gray-400 font-bold mb-1">
                      GW{fix.event}
                    </div>
                    <div
                      className={`w-full h-1.5 rounded-full mb-2 ${getFDRColor(
                        fix.difficulty
                      )}`}
                    ></div>
                    <div>
                      <img
                        src={fix.badge}
                        alt={fix.opponent}
                        className="w-10 h-10 object-contain drop-shadow-lg opacity-90 mb-1"
                      />
                    </div>
                    <div className="font-bold text-sm dark:text-gray-200">
                      {fix.opponent}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      ({fix.isHome ? "H" : "A"})
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-500 italic">
                  No upcoming fixtures found.
                </div>
              )}
            </div>
          </div>
          {isSquadView && (
            <>
              <hr className="border-gray-100 dark:border-gray-700 my-6" />

              {/* Action Buttons */}
              {substituting ? (
                <div className="space-y-3 animate-fadeIn pb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold dark:text-white">
                      Switch with...
                    </h4>
                    <button
                      onClick={() => setSubstituting(false)}
                      className="text-xs text-red-500 font-bold uppercase hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                  {eligibleSubs.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      No substitutes available in this position.
                    </p>
                  ) : (
                    eligibleSubs.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => {
                          onSubstitute(player.id, sub.id);
                          setSubstituting(false);
                        }}
                        className="w-full flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="font-bold text-sm dark:text-gray-200 group-hover:text-green-700 dark:group-hover:text-green-400">
                            {sub.web_name}
                          </div>
                          {!sub.starting ? (
                            <span className="text-[9px] bg-gray-200 text-gray-600 px-1 rounded font-bold">
                              BENCH
                            </span>
                          ) : (
                            <span className="text-[9px] bg-green-100 text-green-700 px-1 rounded font-bold">
                              XI
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          £{(sub.now_cost / 10).toFixed(1)}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 pb-6">
                  <button
                    onClick={() => setSubstituting(true)}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none transition-all"
                  >
                    <ArrowLeftRight size={18} /> Switch
                  </button>
                  <button
                    onClick={() => {
                      onRemove(player.id);
                      onClose();
                    }}
                    className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 py-3 rounded-xl font-bold transition-all border border-red-100 dark:border-red-900/50"
                  >
                    Remove
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
