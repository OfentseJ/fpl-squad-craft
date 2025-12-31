import { useMemo } from "react";
import { X, ShieldCheck } from "lucide-react";
import { getRankedDefenses, getProbColor } from "../../utils/FplUtils";
import { useFPLApi } from "../../hooks/useFPLApi";

export default function CleanSheetModal({
  isOpen,
  onClose,
  teams,
  fixtures,
  startGw,
}) {
  const { getTeamBadgeUrl } = useFPLApi();

  const rankedData = useMemo(() => {
    if (!isOpen || !teams || !fixtures) return [];
    return getRankedDefenses(teams, fixtures, startGw);
  }, [isOpen, teams, fixtures, startGw]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* --- Header --- */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full text-green-600 dark:text-green-400">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white">
                Clean Sheet Odds
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Ranked by defensive potential (Next 5 GWs)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* --- Scrollable Table Content --- */}
        <div className="overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white dark:bg-gray-900 shadow-sm z-10 text-xs uppercase text-gray-500 font-bold tracking-wider">
              <tr>
                <th className="p-4 border-b dark:border-gray-800">Team</th>
                <th className="p-4 border-b dark:border-gray-800">
                  Next 5 Opponents (CS %)
                </th>
                <th className="p-4 border-b dark:border-gray-800 text-center">
                  xCS (Next 5)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {rankedData.map(({ team, totalXCS, matchDetails }, index) => (
                <tr
                  key={team.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  {/* Team Rank & Badge */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 font-mono text-sm w-4">
                        {index + 1}
                      </span>
                      <div
                        className="w-12 h-12 mx-auto shrink-0"
                        title={team.name}
                      >
                        <img
                          src={getTeamBadgeUrl(team.code)}
                          alt={team.short_name}
                          className="w-full h-full object-contain drop-shadow-sm"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </td>

                  {/* Fixtures Visuals */}
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {matchDetails.map((match, i) => (
                        <div
                          key={i}
                          className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg border ${getProbColor(
                            match.prob
                          )} shadow-sm transition-transform hover:scale-105 cursor-help`}
                          title={`vs ${match.opponent?.name} (${
                            match.isHome ? "H" : "A"
                          })\nCS Probability: ${(match.prob * 100).toFixed(
                            1
                          )}%`}
                        >
                          <span className="text-[10px] font-bold uppercase truncate max-w-full px-1">
                            {match.opponent?.short_name}
                          </span>
                          <span className="text-[9px] opacity-80 leading-none mb-0.5">
                            {match.isHome ? "(H)" : "(A)"}
                          </span>
                          <span className="text-xs font-black">
                            {Math.round(match.prob * 100)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* Total Expected Clean Sheets */}
                  <td className="p-4 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className="text-2xl font-black text-green-600 dark:text-green-400">
                        {totalXCS.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-gray-400 uppercase font-bold whitespace-nowrap">
                        Exp. Clean Sheets
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
