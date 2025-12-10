import { useFPLApi } from "../../hooks/useFplApi";
import { AlertTriangle } from "lucide-react";

export default function PlayerShirt({ player, onClick, inPitch, fixtures }) {
  const teams = player.teams || [];
  const isGK = player.element_type === 1;
  const team = teams.find((t) => t.id === player.team);
  const { getShirtUrl } = useFPLApi();

  const shirtUrl = getShirtUrl(team, isGK);

  // Captaincy Flags
  const isCaptain = player.is_captain;
  const isViceCaptain = player.is_vice_captain;

  // --- Injury Logic ---
  const chance = player.chance_of_playing_next_round;
  const isInjured = chance !== null && chance < 100;

  // Determine styling based on injury status
  // 1. Badge Color (The Icon)
  const badgeBg = chance === 0 ? "bg-red-600" : "bg-yellow-400";
  const badgeText = chance === 0 ? "text-white" : "text-black";

  // 2. Name Box Color (The Text Box)
  let statusBg =
    "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700";
  let statusText = "text-gray-900 dark:text-white";
  let subText = "text-gray-600 dark:text-gray-400";

  if (isInjured) {
    if (chance === 0) {
      statusBg = "bg-red-500 border-red-600";
      statusText = "text-white";
      subText = "text-red-100";
    } else {
      statusBg = "bg-yellow-400 border-yellow-500";
      statusText = "text-black";
      subText = "text-yellow-900/70";
    }
  }

  // Get next opponent from fixtures
  const getNextOpponent = () => {
    if (!fixtures || fixtures.length === 0) return "—";

    const nextFixture = fixtures.find(
      (f) =>
        !f.finished && (f.team_h === player.team || f.team_a === player.team)
    );

    if (!nextFixture) return "—";

    const isHome = nextFixture.team_h === player.team;
    const opponentId = isHome ? nextFixture.team_a : nextFixture.team_h;
    const opponentTeam = teams.find((t) => t.id === opponentId);

    if (!opponentTeam) return "—";

    return isHome
      ? opponentTeam.short_name.toUpperCase()
      : opponentTeam.short_name.toLowerCase();
  };

  return (
    <div
      onClick={onClick}
      className="relative flex flex-col items-center cursor-pointer transition-all hover:scale-105 active:scale-95 z-10 w-16 sm:w-20 md:w-24"
    >
      <div className="relative bg-slate-500/50 backdrop-filter backdrop-blur border-slate-500 border rounded-md pt-1.5 w-full flex flex-col items-center">
        {/* --- Captaincy Badge (Top Right) --- */}
        {(isCaptain || isViceCaptain) && (
          <div className="absolute -top-2 -right-2 bg-black text-white text-[9px] sm:text-[10px] font-black w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full border border-white z-30 shadow-sm">
            {isCaptain ? "C" : "V"}
          </div>
        )}

        {/* --- Injury Warning Badge (Top Left) --- */}
        {isInjured && (
          <div
            className={`absolute -top-2 -left-2 ${badgeBg} ${badgeText} w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full border border-white z-30 shadow-sm`}
          >
            <AlertTriangle size={12} />
          </div>
        )}

        {/* Shirt Image */}
        <div className="-mb-4 sm:-mb-5 z-10">
          <img
            src={shirtUrl}
            alt={`${team?.short_name || ""} shirt`}
            className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain drop-shadow-sm"
          />
        </div>

        {/* Player Info Box */}
        <div
          className={`relative text-center rounded-sm px-1 py-0.5 shadow-md z-20 border w-[95%] sm:w-full transition-colors duration-300 ${statusBg} ${
            inPitch
              ? "min-w-[60px] sm:min-w-[70px] md:min-w-20"
              : "min-w-[60px] sm:min-w-[70px]"
          }`}
        >
          <div
            className={`text-[10px] sm:text-xs font-bold leading-tight truncate px-0.5 ${statusText}`}
          >
            {player.web_name}
          </div>
          <div
            className={`text-[9px] sm:text-[10px] leading-none mt-0.5 ${subText}`}
          >
            {getNextOpponent()}
          </div>
        </div>
      </div>
    </div>
  );
}
