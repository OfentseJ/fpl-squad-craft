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
} from "lucide-react";
import { useFPLApi } from "../../hooks/useFPLApi";

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
  const { getPlayerImageUrl, getTeamBadgeUrl } = useFPLApi();

  const positionMap = {
    1: "Goalkeeper",
    2: "Defender",
    3: "Midfielder",
    4: "Forward",
  };

  const team = player.teams?.find((t) => t.id === player.team);

  // --- Injury / Availability Logic ---
  const chance = player.chance_of_playing_next_round;
  const isInjured = chance !== null && chance < 100;

  // Dynamic colors for injury status
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

  // --- Fixture Logic ---
  const getNextFixtures = () => {
    if (!fixtures || fixtures.length === 0) return [];

    const teamFixtures = fixtures.filter(
      (f) =>
        (f.team_h === player.team || f.team_a === player.team) && !f.finished
    );

    return teamFixtures
      .sort((a, b) => a.event - b.event)
      .slice(0, 5) // Show 5 fixtures for better planning
      .map((f) => {
        const isHome = f.team_h === player.team;
        const opponentId = isHome ? f.team_a : f.team_h;
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

  // Official-ish FPL FDR Colors
  const getFDRColor = (difficulty) => {
    if (difficulty <= 2) return "bg-[#00FF87] text-black"; // Green
    if (difficulty === 3) return "bg-[#E7E7E7] text-black"; // Grey
    if (difficulty === 4) return "bg-[#FF3350] text-white"; // Pinkish Red
    return "bg-[#80072D] text-white"; // Dark Red
  };

  return (
    <>
      {/* Backdrop with Blur */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-100 animate-fadeIn transition-opacity"
        onClick={onClose}
      />

      {/* Modal Slide-over */}
      <div className="fixed right-0 top-0 bottom-0 w-full sm:w-100 bg-white dark:bg-gray-900 shadow-2xl z-100 flex flex-col animate-slideInRight border-l border-gray-200 dark:border-gray-800">
        {/* --- HEADER SECTION --- */}
        <div className="relative h-56 bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden shrink-0">
          {/* Abstract background pattern */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          ></div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-30 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-all hover:rotate-90"
          >
            <X size={20} />
          </button>

          {/* Player Image (Large) */}
          <div className="absolute bottom-0 left-4 z-10 w-40 h-40">
            <img
              src={getPlayerImageUrl(player.code)}
              alt={player.web_name}
              className="w-full h-full object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] transform translate-y-2 scale-110"
              onError={(e) => (e.target.style.display = "none")}
            />
          </div>

          {/* Player Info (Right Aligned) */}
          <div className="absolute bottom-5 right-6 text-right text-white z-20 flex flex-col items-end">
            {/* Team Badge with glow */}
            <div className="relative mb-2">
              <div className="absolute inset-0 bg-white/20 blur-xl rounded-full"></div>
              <img
                src={getTeamBadgeUrl(team?.code)}
                alt="Badge"
                className="relative w-12 h-12 object-contain"
              />
            </div>

            <h2 className="text-3xl font-black tracking-tight leading-none mb-1 drop-shadow-md">
              {player.web_name}
            </h2>
            <div className="flex items-center gap-2 text-sm font-medium text-purple-200 bg-black/20 px-2 py-0.5 rounded-md backdrop-blur-sm">
              <span>{team?.short_name}</span>
              <span className="w-1 h-1 bg-purple-300 rounded-full"></span>
              <span>{positionMap[player.element_type]}</span>
            </div>
          </div>
        </div>

        {/* --- SCROLLABLE CONTENT --- */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-6 space-y-6">
            {/* 1. Injury / News Banner */}
            {isInjured && player.news && (
              <div
                className={`rounded-xl p-4 border flex gap-3 items-start shadow-sm ${injuryStyles.bg} ${injuryStyles.border}`}
              >
                <AlertTriangle
                  className={`${injuryStyles.icon} shrink-0 mt-0.5`}
                  size={18}
                />
                <div>
                  <div
                    className={`text-xs font-bold uppercase tracking-wider mb-1 ${injuryStyles.text}`}
                  >
                    {chance === 0
                      ? "Unavailable"
                      : `${chance}% Chance of Playing`}
                  </div>
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-relaxed">
                    {player.news}
                  </div>
                </div>
              </div>
            )}

            {/* 2. Key Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <StatBox
                label="Price"
                value={`£${(player.now_cost / 10).toFixed(1)}`}
                icon={<Info size={14} />}
                color="text-blue-600 dark:text-blue-400"
              />
              <StatBox
                label="Points"
                value={player.total_points}
                icon={<Zap size={14} />}
                color="text-yellow-600 dark:text-yellow-400"
              />
              <StatBox
                label="Selected"
                value={`${player.selected_by_percent}%`}
                icon={<Shield size={14} />}
                color="text-purple-600 dark:text-purple-400"
              />
            </div>

            {/* 3. Fixture Ticker */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <CalendarDays size={14} /> Upcoming Fixtures
              </h3>

              <div className="flex gap-2 overflow-x-auto pb-4 pt-1 px-1 -mx-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
                {nextFixtures.length > 0 ? (
                  nextFixtures.map((fix) => (
                    <div
                      key={fix.event}
                      className="shrink-0 w-20 flex flex-col items-center p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm relative group"
                    >
                      <span className="text-[10px] font-bold text-gray-400 mb-2">
                        GW{fix.event}
                      </span>

                      <img
                        src={fix.badge}
                        alt={fix.opponent}
                        className="w-8 h-8 object-contain mb-2 group-hover:scale-110 transition-transform"
                      />

                      <span className="text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
                        {fix.opponent}
                      </span>

                      <div
                        className={`w-full text-[10px] font-bold text-center py-0.5 rounded ${getFDRColor(
                          fix.difficulty
                        )}`}
                      >
                        {fix.isHome ? "(H)" : "(A)"}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="w-full py-4 text-center text-sm text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
                    Season Finished / No Fixtures
                  </div>
                )}
              </div>
            </div>

            <div className="h-px bg-gray-100 dark:bg-gray-800 my-4" />

            {/* 4. Actions: Captaincy */}
            {inSquad && !isBench && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  Captaincy
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <CaptainButton
                    isActive={isCaptain}
                    onClick={() => onSetCaptain(player.id)}
                    label="Captain"
                    type="C"
                  />
                  <CaptainButton
                    isActive={isViceCaptain}
                    onClick={() => onSetViceCaptain(player.id)}
                    label="Vice-Captain"
                    type="V"
                  />
                </div>
              </div>
            )}

            {inSquad && isBench && (
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center text-xs text-gray-500">
                Cannot change captaincy on bench players.
              </div>
            )}
          </div>
        </div>

        {/* --- FOOTER ACTIONS --- */}
        {inSquad ? (
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-3">
            {isSavedState ? (
              <div className="grid grid-cols-2 gap-3">
                <ActionButton
                  onClick={() => onSubstituteStart(player.id)}
                  icon={<ArrowLeftRight size={18} />}
                  label="Substitute"
                  color="bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200"
                />
                <ActionButton
                  onClick={() => {
                    onTransfer(player.id);
                    onClose();
                  }}
                  icon={<RefreshCw size={18} />}
                  label="Transfer"
                  color="bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200"
                />
              </div>
            ) : (
              <ActionButton
                onClick={() => {
                  onRemove(player.id);
                  onClose();
                }}
                icon={<X size={18} />}
                label="Remove"
                color="w-34 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
              />
            )}
          </div>
        ) : (
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-center">
            <p className="text-sm text-gray-500">
              Add player to squad to see actions
            </p>
          </div>
        )}
      </div>
    </>
  );
}

// --- Sub-Components for cleaner JSX ---

function StatBox({ label, value, icon, color }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl text-center border border-gray-100 dark:border-gray-700 shadow-sm">
      <div
        className={`flex items-center justify-center gap-1 text-[10px] uppercase font-bold mb-1 opacity-70 ${color}`}
      >
        {icon} {label}
      </div>
      <div className="text-xl font-black text-gray-800 dark:text-white tracking-tight">
        {value}
      </div>
    </div>
  );
}

function CaptainButton({ isActive, onClick, label, type }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 ${
        isActive
          ? type === "C"
            ? "bg-linear-to-r from-yellow-400 to-yellow-600 text-white shadow-lg shadow-yellow-200 dark:shadow-none ring-2 ring-yellow-200 dark:ring-yellow-900"
            : "bg-linear-to-r from-pink-500 to-rose-600 text-white shadow-lg shadow-rose-200 dark:shadow-none ring-2 ring-rose-200 dark:ring-rose-900"
          : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-750"
      }`}
    >
      <Crown size={16} className={isActive ? "fill-current" : ""} />
      {isActive ? label : `Make ${type}`}
    </button>
  );
}

function ActionButton({ onClick, icon, label, color }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg ${color}`}
    >
      {icon} {label}
    </button>
  );
}
