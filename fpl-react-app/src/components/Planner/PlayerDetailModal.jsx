import { useState, useEffect } from "react";
import {
  X,
  ArrowLeftRight,
  CalendarDays,
  Crown,
  AlertTriangle,
  RefreshCw,
  Info,
  Shield,
  Zap,
  ChevronDown,
  ChevronUp,
  List,
  History,
  Activity,
} from "lucide-react";
import { useFPLApi } from "../../hooks/useFPLApi";
import { getFDRClass } from "../../utils/FplUtils";

export default function PlayerDetailModal({
  player,
  fixtures,
  onClose,
  onRemove,
  onSubstituteStart,
  isSavedState = false,
  inSquad,
  isCaptain,
  isViceCaptain,
  onSetCaptain,
  onSetViceCaptain,
  onTransfer,
  isBench = false,
}) {
  const { getPlayerImageUrl, getTeamBadgeUrl, getPlayerHistory } = useFPLApi();

  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("fixtures");
  const [historyData, setHistoryData] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const positionMap = {
    1: "Goalkeeper",
    2: "Defender",
    3: "Midfielder",
    4: "Forward",
  };

  const team = player.teams?.find((t) => t.id === player.team);
  const playerBadge = getTeamBadgeUrl(team?.code); // Player's team badge

  // --- Injury / Availability Logic ---
  const chance = player.chance_of_playing_next_round;
  const isInjured = chance !== null && chance < 100;

  const injuryStyles =
    chance === 0
      ? {
          bg: "bg-red-50 dark:bg-red-900/20",
          border: "border-red-200 dark:border-red-800",
          text: "text-red-700 dark:text-red-300",
          icon: "text-red-500",
        }
      : {
          bg: "bg-amber-50 dark:bg-amber-900/20",
          border: "border-amber-200 dark:border-amber-800",
          text: "text-amber-700 dark:text-amber-300",
          icon: "text-amber-500",
        };

  // --- Fixture Logic (Summary) ---
  const getNextFixtures = () => {
    if (!fixtures || fixtures.length === 0) return [];
    const teamFixtures = fixtures.filter(
      (f) =>
        (f.team_h === player.team || f.team_a === player.team) && !f.finished
    );
    return teamFixtures.sort((a, b) => a.event - b.event);
  };

  const allFixtures = getNextFixtures();
  const summaryFixtures = allFixtures.slice(0, 5).map((f) => {
    const isHome = f.team_h === player.team;
    const opponentId = isHome ? f.team_a : f.team_h;
    const opponent = player.teams?.find((t) => t.id === opponentId);
    return {
      event: f.event,
      opponent: opponent?.short_name || "OPP",
      isHome,
      difficulty: isHome ? f.team_h_difficulty : f.team_a_difficulty,
      badge: getTeamBadgeUrl(opponent?.code),
    };
  });

  // --- History Fetch Logic ---
  useEffect(() => {
    if (isExpanded && activeTab === "history" && !historyData) {
      setLoadingHistory(true);
      getPlayerHistory(player.id)
        .then((data) => {
          if (data) setHistoryData(data);
          setLoadingHistory(false);
        })
        .catch((err) => {
          console.error(err);
          setLoadingHistory(false);
        });
    }
  }, [isExpanded, activeTab, player.id, historyData, getPlayerHistory]);

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fadeIn transition-opacity"
        onClick={onClose}
      />

      <div className="fixed right-0 top-0 bottom-0 w-full sm:w-125 bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col animate-slideInRight border-l border-gray-200 dark:border-gray-800">
        {/* --- HEADER --- */}
        <div className="relative h-48 bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden shrink-0">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          ></div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-30 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-all hover:rotate-90"
          >
            <X size={20} />
          </button>

          <div className="absolute bottom-0 left-4 z-10 w-32 h-32">
            <img
              src={getPlayerImageUrl(player.code)}
              alt={player.web_name}
              className="w-full h-full object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] transform translate-y-2 scale-110"
              onError={(e) => (e.target.style.display = "none")}
            />
          </div>

          <div className="absolute bottom-4 right-6 text-right text-white z-20 flex flex-col items-end">
            <div className="relative mb-2">
              <div className="absolute inset-0 bg-white/20 blur-xl rounded-full"></div>
              <img
                src={playerBadge}
                alt="Badge"
                className="relative w-10 h-10 object-contain"
              />
            </div>
            <h2 className="text-2xl font-black tracking-tight leading-none mb-1 drop-shadow-md">
              {player.web_name}
            </h2>
            <div className="flex items-center gap-2 text-xs font-medium text-purple-200 bg-black/20 px-2 py-0.5 rounded-md backdrop-blur-sm">
              <span>{team?.short_name}</span>
              <span className="w-1 h-1 bg-purple-300 rounded-full"></span>
              <span>{positionMap[player.element_type]}</span>
            </div>
          </div>
        </div>

        {/* --- SCROLLABLE CONTENT --- */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-white dark:bg-gray-900">
          <div className="p-5 space-y-5">
            {/* Injury Banner */}
            {isInjured && player.news && (
              <div
                className={`rounded-xl p-3 border flex gap-3 items-start shadow-sm ${injuryStyles.bg} ${injuryStyles.border}`}
              >
                <AlertTriangle
                  className={`${injuryStyles.icon} shrink-0 mt-0.5`}
                  size={16}
                />
                <div>
                  <div
                    className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${injuryStyles.text}`}
                  >
                    {chance === 0
                      ? "Unavailable"
                      : `${chance}% Chance of Playing`}
                  </div>
                  <div className="text-xs font-medium text-gray-800 dark:text-gray-200 leading-relaxed">
                    {player.news}
                  </div>
                </div>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <StatBox
                label="Price"
                value={`£${(player.now_cost / 10).toFixed(1)}`}
                icon={<Info size={12} />}
                color="text-blue-600 dark:text-blue-400"
              />
              <StatBox
                label="Points"
                value={player.total_points}
                icon={<Zap size={12} />}
                color="text-yellow-600 dark:text-yellow-400"
              />
              <StatBox
                label="Selected"
                value={`${player.selected_by_percent}%`}
                icon={<Shield size={12} />}
                color="text-purple-600 dark:text-purple-400"
              />
            </div>

            {/* Summary Ticker */}
            {!isExpanded && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <CalendarDays size={12} /> Upcoming
                </h3>
                <div className="flex gap-2 overflow-x-auto pb-2 px-1 -mx-1 scrollbar-none">
                  {summaryFixtures.map((fix) => (
                    <div
                      key={fix.event}
                      className="shrink-0 w-16 flex flex-col items-center p-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 relative"
                    >
                      <span className="text-[9px] font-bold text-gray-400 mb-1">
                        GW{fix.event}
                      </span>
                      <img
                        src={fix.badge}
                        alt={fix.opponent}
                        className="w-6 h-6 object-contain mb-1"
                      />
                      <div
                        className={`w-full text-[9px] font-bold text-center py-0.5 rounded text-white ${getFDRClass(
                          fix.difficulty
                        )}`}
                      >
                        {fix.difficulty}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* EXPANDABLE SECTION */}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-center gap-2 py-2 text-sm font-bold text-gray-500 hover:text-green-600 dark:hover:text-green-400 transition-colors bg-gray-50 dark:bg-gray-800/50 rounded-lg group"
              >
                {isExpanded ? "Show Less" : "Full Player Details"}
                {isExpanded ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown
                    size={16}
                    className="group-hover:translate-y-0.5 transition-transform"
                  />
                )}
              </button>

              {isExpanded && (
                <div className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  {/* Tabs */}
                  <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4">
                    <button
                      onClick={() => setActiveTab("fixtures")}
                      className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-bold transition-all ${
                        activeTab === "fixtures"
                          ? "bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <List size={14} /> Future
                    </button>
                    <button
                      onClick={() => setActiveTab("history")}
                      className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-bold transition-all ${
                        activeTab === "history"
                          ? "bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <History size={14} /> History
                    </button>
                  </div>

                  <div className="min-h-50">
                    {/* Fixtures List */}
                    {activeTab === "fixtures" && (
                      <div className="space-y-2">
                        {allFixtures.map((f, i) => {
                          const isHome = f.team_h === player.team;
                          const opponentId = isHome ? f.team_a : f.team_h;
                          const opponent = player.teams?.find(
                            (t) => t.id === opponentId
                          );
                          const difficulty = isHome
                            ? f.team_h_difficulty
                            : f.team_a_difficulty;

                          return (
                            <div
                              key={i}
                              className="flex items-center justify-between p-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors border border-gray-100 dark:border-gray-800 shadow-sm"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-gray-400 w-8 text-center">
                                  GW{f.event}
                                </span>
                                <div className="flex items-center gap-2">
                                  <img
                                    src={getTeamBadgeUrl(opponent?.code)}
                                    className="w-6 h-6 object-contain"
                                  />
                                  <div>
                                    <div className="text-sm font-bold text-gray-700 dark:text-gray-200 leading-none">
                                      {opponent?.name || "TBC"}
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-medium">
                                      {isHome ? "Home" : "Away"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <span
                                className={`text-xs font-bold px-3 py-1 rounded-md text-white shadow-sm ${getFDRClass(
                                  difficulty
                                )}`}
                              >
                                FDR {difficulty}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* History List */}
                    {activeTab === "history" && (
                      <>
                        {loadingHistory ? (
                          <div className="flex flex-col items-center justify-center py-8 text-gray-400 gap-2">
                            <Activity className="animate-spin" size={20} />
                            <span className="text-xs">Loading stats...</span>
                          </div>
                        ) : historyData?.history ? (
                          <div className="space-y-1">
                            {historyData.history
                              .slice()
                              .reverse()
                              .map((match, i) => {
                                const opponent = player.teams?.find(
                                  (t) => t.id === match.opponent_team
                                );
                                const opponentBadge = getTeamBadgeUrl(
                                  opponent?.code
                                );

                                // Determine Home/Away Logic
                                const isPlayerHome = match.was_home;

                                // 1. Identify which badge/name goes where
                                const homeBadge = isPlayerHome
                                  ? playerBadge
                                  : opponentBadge;
                                const awayBadge = isPlayerHome
                                  ? opponentBadge
                                  : playerBadge;

                                const homeShortName = isPlayerHome
                                  ? team?.short_name
                                  : opponent?.short_name;
                                const awayShortName = isPlayerHome
                                  ? opponent?.short_name
                                  : team?.short_name;

                                // 2. Score Format: Home - Away
                                const homeTeamScore = match.team_h_score
                                  ? match.team_h_score
                                  : 0;
                                const awayTeamScore = match.team_a_score
                                  ? match.team_a_score
                                  : 0;

                                const score = `${homeTeamScore}-${awayTeamScore}`;

                                return (
                                  <div
                                    key={i}
                                    className="grid grid-cols-12 gap-1 items-center p-2 text-xs border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                  >
                                    {/* GW Number */}
                                    <div className="col-span-2 font-bold text-gray-400">
                                      GW{match.round}
                                    </div>

                                    {/* Match Display */}
                                    <div className="col-span-6 flex items-center justify-start">
                                      {/* HOME TEAM (Left) */}
                                      <div className="flex flex-col items-center w-8">
                                        <img
                                          src={homeBadge}
                                          className="w-5 h-5 object-contain mb-0.5"
                                          alt="Home"
                                        />
                                        <span className="text-[9px] text-gray-400 font-bold">
                                          {homeShortName}
                                        </span>
                                      </div>

                                      {/* SCORE (Center) */}
                                      <div className="px-2 font-black text-gray-700 dark:text-gray-200 min-w-8 text-center">
                                        {score}
                                      </div>

                                      {/* AWAY TEAM (Right) */}
                                      <div className="flex flex-col items-center w-8">
                                        <img
                                          src={awayBadge}
                                          className="w-5 h-5 object-contain mb-0.5"
                                          alt="Away"
                                        />
                                        <span className="text-[9px] text-gray-400 font-bold">
                                          {awayShortName}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Minutes */}
                                    <div className="col-span-2 text-center text-gray-500">
                                      {match.minutes}'
                                    </div>

                                    {/* Points */}
                                    <div className="col-span-2 text-right font-black">
                                      <span
                                        className={`${
                                          match.total_points >= 8
                                            ? "text-green-600 dark:text-green-400"
                                            : match.total_points >= 5
                                            ? "text-blue-500 dark:text-blue-400"
                                            : "text-gray-800 dark:text-gray-200"
                                        }`}
                                      >
                                        {match.total_points}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-xs text-gray-400">
                            No history available
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Captaincy */}
            {inSquad && !isBench && (
              <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <div className="grid grid-cols-2 gap-2">
                  <CaptainButton
                    isActive={isCaptain}
                    onClick={() => onSetCaptain(player.id)}
                    label="Captain"
                    type="C"
                  />
                  <CaptainButton
                    isActive={isViceCaptain}
                    onClick={() => onSetViceCaptain(player.id)}
                    label="Vice - Captain"
                    type="V"
                  />
                </div>
              </div>
            )}

            {inSquad && isBench && (
              <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-center text-[10px] text-gray-500 italic border border-dashed border-gray-200 dark:border-gray-700">
                Captaincy unavailable on bench
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {inSquad ? (
          <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
            {isSavedState ? (
              <div className="grid grid-cols-2 gap-2">
                <ActionButton
                  onClick={() => onSubstituteStart(player.id)}
                  icon={<ArrowLeftRight size={16} />}
                  label="Switch"
                  color="bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 dark:shadow-none"
                />
                <ActionButton
                  onClick={() => {
                    onTransfer(player.id);
                    onClose();
                  }}
                  icon={<RefreshCw size={16} />}
                  label="Transfer"
                  color="bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200 dark:shadow-none"
                />
              </div>
            ) : (
              <ActionButton
                onClick={() => {
                  onRemove(player.id);
                  onClose();
                }}
                icon={<X size={16} />}
                label="Remove Player"
                color="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 dark:border-red-800 dark:bg-red-900/20"
              />
            )}
          </div>
        ) : (
          <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-center">
            <button
              onClick={() => {
                onClose();
                onTransfer(player.id);
              }}
              className="w-full py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} /> Transfer In
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// Sub-components
function StatBox({ label, value, icon, color }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-2.5 rounded-xl text-center border border-gray-100 dark:border-gray-700 shadow-sm">
      <div
        className={`flex items-center justify-center gap-1 text-[9px] uppercase font-bold mb-0.5 opacity-70 ${color}`}
      >
        {icon} {label}
      </div>
      <div className="text-lg font-black text-gray-800 dark:text-white tracking-tight leading-none">
        {value}
      </div>
    </div>
  );
}

function CaptainButton({ isActive, onClick, label, type }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 ${
        isActive
          ? type === "C"
            ? "bg-linear-to-r from-yellow-400 to-yellow-600 text-white shadow-md"
            : "bg-linear-to-r from-pink-500 to-rose-600 text-white shadow-md"
          : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
      }`}
    >
      <Crown size={14} className={isActive ? "fill-current" : ""} />
      {isActive ? label : `Make ${type}`}
    </button>
  );
}

function ActionButton({ onClick, icon, label, color }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-sm ${color}`}
    >
      {icon} {label}
    </button>
  );
}
