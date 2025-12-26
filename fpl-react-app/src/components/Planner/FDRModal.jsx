import { X, Calendar } from "lucide-react";
import { useMemo } from "react";
import { useFPLApi } from "../../hooks/useFPLApi"; // 1. Import Hook

export default function FDRModal({
  isOpen,
  onClose,
  teams,
  fixtures,
  startGw,
}) {
  const { getTeamBadgeUrl } = useFPLApi(); // 2. Get the badge helper

  // Logic to organize fixtures into a grid (Same as before)
  const schedule = useMemo(() => {
    if (!teams || !fixtures) return {};

    const grid = {};
    const endGw = 38;

    teams.forEach((team) => {
      grid[team.id] = {};
      for (let gw = startGw; gw <= endGw; gw++) {
        grid[team.id][gw] = [];
      }
    });

    fixtures.forEach((fix) => {
      if (fix.event < startGw || fix.event > endGw) return;
      const homeTeamId = fix.team_h;
      const awayTeamId = fix.team_a;

      if (grid[homeTeamId] && grid[homeTeamId][fix.event]) {
        grid[homeTeamId][fix.event].push({
          opponentId: awayTeamId,
          difficulty: fix.team_h_difficulty,
          isHome: true,
        });
      }

      if (grid[awayTeamId] && grid[awayTeamId][fix.event]) {
        grid[awayTeamId][fix.event].push({
          opponentId: homeTeamId,
          difficulty: fix.team_a_difficulty,
          isHome: false,
        });
      }
    });

    return grid;
  }, [teams, fixtures, startGw]);

  // Updated Colors: Added text colors to ensure contrast
  const getFDRClass = (diff) => {
    if (diff <= 2) return "bg-[#01fc7a] text-black border-green-600"; // Easy (Green)
    if (diff === 3) return "bg-gray-200 text-gray-900 border-gray-300"; // Med (Grey)
    if (diff === 4) return "bg-[#ff1751] text-white border-red-600"; // Hard (Red)
    return "bg-[#80072d] text-white border-red-900"; // Tough (Dark Red)
  };

  const getTeamShortName = (id) =>
    teams?.find((t) => t.id === id)?.short_name || "-";

  if (!isOpen) return null;

  const gameweeks = Array.from(
    { length: 38 - startGw + 1 },
    (_, i) => startGw + i
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-[80vw] h-[90vh] flex flex-col border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-green-600 dark:text-green-400">
              <Calendar size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Fixture Difficulty Ticker
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                GW{startGw} — GW38
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Scrollable Matrix */}
        <div className="flex-1 overflow-auto bg-white dark:bg-gray-900 relative custom-scrollbar">
          <table className="border-collapse w-full text-xs">
            <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0 z-20 shadow-sm">
              <tr>
                {/* Sticky Team Badge Column */}
                <th className="sticky left-0 z-30 bg-gray-100 dark:bg-gray-800 p-2 w-15 min-w-15 text-center border-b border-r border-gray-200 dark:border-gray-700 font-bold text-gray-700 dark:text-gray-300 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                  Team
                </th>
                {/* Gameweek Headers */}
                {gameweeks.map((gw) => (
                  <th
                    key={gw}
                    className="p-2 min-w-12.5 border-b border-r border-gray-200 dark:border-gray-700 text-center text-gray-500 font-bold"
                  >
                    GW{gw}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {teams?.map((team) => (
                <tr
                  key={team.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors h-14" // Fixed height for consistency
                >
                  {/* Sticky Team Badge Cell */}
                  <td className="sticky left-0 z-10 bg-white dark:bg-gray-900 p-1 border-b border-r border-gray-200 dark:border-gray-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] align-middle text-center">
                    <div className="w-8 h-8 mx-auto" title={team.name}>
                      <img
                        src={getTeamBadgeUrl(team.code)}
                        alt={team.short_name}
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                    </div>
                  </td>

                  {/* Fixture Cells */}
                  {gameweeks.map((gw) => {
                    const fixturesForGw = schedule[team.id]?.[gw] || [];

                    return (
                      <td
                        key={`${team.id}-${gw}`}
                        className="border-b border-r border-gray-100 dark:border-gray-800 p-0 h-14 align-middle"
                      >
                        {fixturesForGw.length === 0 ? (
                          // Blank Gameweek (Grayed out)
                          <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 text-gray-300">
                            -
                          </div>
                        ) : (
                          // Render Fixtures (Flex col handles Double Gameweeks)
                          <div className="flex flex-col h-full w-full">
                            {fixturesForGw.map((f, idx) => (
                              <div
                                key={idx}
                                // flex-1 makes them share height equally (50/50 if DGW)
                                className={`flex-1 w-full flex flex-col items-center justify-center text-[10px] leading-none ${getFDRClass(
                                  f.difficulty
                                )}`}
                                title={`${team.name} vs ${getTeamShortName(
                                  f.opponentId
                                )} (${f.isHome ? "H" : "A"})`}
                              >
                                <span className="font-bold">
                                  {getTeamShortName(f.opponentId)}
                                </span>
                                <span className="opacity-80 text-[8px] uppercase">
                                  {f.isHome ? "(H)" : "(A)"}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Legend */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-center gap-6 text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-400 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#01fc7a] rounded"></div> Easy
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded"></div>{" "}
            Medium
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#ff1751] rounded"></div> Hard
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#80072d] rounded"></div> Tough
          </div>
        </div>
      </div>
    </div>
  );
}
