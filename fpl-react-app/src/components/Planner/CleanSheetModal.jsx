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
        <div className="shrink-0 p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full text-green-600 dark:text-green-400">
              <ShieldCheck size={20} className="sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white leading-tight">
                CS Odds
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Next 5 GWs Ranked
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

        {/* --- List Content (Div-based for Mobile stacking) --- */}
        <div className="overflow-y-auto p-2 sm:p-0 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
          {/* Desktop Table Headers (Hidden on Mobile) */}
          <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-3 bg-white dark:bg-gray-900 sticky top-0 z-10 border-b dark:border-gray-800 text-xs uppercase text-gray-500 font-bold tracking-wider">
            <div className="col-span-3">Team</div>
            <div className="col-span-7">Next 5 Opponents</div>
            <div className="col-span-2 text-center">xCS</div>
          </div>

          <div className="flex flex-col gap-2 sm:gap-0">
            {rankedData.map(({ team, totalXCS, matchDetails }, index) => (
              <div
                key={team.id}
                className="group relative flex flex-col sm:grid sm:grid-cols-12 sm:gap-4 p-3 sm:px-4 sm:py-3 bg-white dark:bg-gray-800/50 sm:bg-transparent rounded-xl sm:rounded-none border sm:border-0 border-gray-100 dark:border-gray-700 sm:border-b sm:hover:bg-gray-50 dark:sm:hover:bg-gray-800/50 transition-colors"
              >
                {/* 1. Team & Rank (Mobile: Top Row, Desktop: Col 1) */}
                <div className="flex items-center justify-between sm:justify-start sm:col-span-3 mb-3 sm:mb-0">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-[10px] sm:text-sm font-bold text-gray-500">
                      {index + 1}
                    </span>
                    <div className="w-6 h-6 sm:w-8 sm:h-8 shrink-0">
                      <img
                        src={getTeamBadgeUrl(team.code)}
                        alt={team.short_name}
                        className="w-full h-full object-contain drop-shadow-sm"
                        loading="lazy"
                      />
                    </div>
                    <span className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                      {team.name}
                    </span>
                  </div>

                  {/* Mobile Only: xCS Score displayed in header */}
                  <div className="sm:hidden flex flex-col items-end">
                    <span className="text-lg font-black text-green-600 dark:text-green-400 leading-none">
                      {totalXCS.toFixed(1)}
                    </span>
                    <span className="text-[9px] text-gray-400 font-bold uppercase">
                      xCS
                    </span>
                  </div>
                </div>

                {/* 2. Fixtures (Mobile: Bottom Row Grid, Desktop: Col 2) */}
                <div className="sm:col-span-7">
                  <div className="grid grid-cols-5 gap-1.5 sm:flex sm:flex-wrap sm:gap-2">
                    {matchDetails.map((match, i) => (
                      <div
                        key={i}
                        className={`flex flex-col items-center justify-center h-12 sm:h-14 rounded sm:rounded-lg border ${getProbColor(
                          match.prob
                        )} shadow-sm sm:w-14 transition-transform sm:hover:scale-105`}
                      >
                        <span className="text-[9px] sm:text-[10px] font-bold uppercase truncate max-w-full px-0.5">
                          {match.opponent?.short_name}
                        </span>
                        <span className="hidden sm:block text-[9px] opacity-80 leading-none mb-0.5">
                          {match.isHome ? "(H)" : "(A)"}
                        </span>
                        {/* Mobile: Combined H/A indicator */}
                        <span className="sm:hidden text-[8px] opacity-70 leading-none -mt-0.5 mb-0.5">
                          {match.isHome ? "H" : "A"}
                        </span>
                        <span className="text-[10px] sm:text-xs font-black">
                          {Math.round(match.prob * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Desktop Only: xCS Score (Col 3) */}
                <div className="hidden sm:flex sm:col-span-2 items-center justify-center">
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-black text-green-600 dark:text-green-400">
                      {totalXCS.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase font-bold">
                      Exp. Clean Sheets
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
