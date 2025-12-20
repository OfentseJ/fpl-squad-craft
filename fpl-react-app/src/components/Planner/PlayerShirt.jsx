import { useFPLApi } from "../../hooks/useFplApi";
import { AlertTriangle } from "lucide-react";

export default function PlayerShirt({
  player,
  onClick,
  inPitch,
  fixtures,
  gameweekId,
}) {
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

  // Badge Logic
  const badgeBg = chance === 0 ? "bg-red-600" : "bg-yellow-400";
  const badgeText = chance === 0 ? "text-white" : "text-black";

  // Name Box Logic
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

  // --- GW SPECIFIC FIXTURE LOGIC ---
  let difficulty = 0;
  let opponentDisplay = "—";

  if (fixtures && fixtures.length > 0) {
    // 1. Filter fixtures specifically for this player's team
    const teamFixtures = fixtures.filter(
      (f) => f.team_h === player.team || f.team_a === player.team
    );

    let relevantFixture = null;

    // 2. Logic: If gameweekId is provided, find THAT match.
    //    Otherwise, default to next unfinished (legacy behavior).
    if (gameweekId) {
      relevantFixture = teamFixtures.find((f) => f.event === gameweekId);
    } else {
      relevantFixture = teamFixtures.find((f) => !f.finished);
    }

    // 3. Display Logic
    if (relevantFixture) {
      const isHome = relevantFixture.team_h === player.team;
      const opponentId = isHome
        ? relevantFixture.team_a
        : relevantFixture.team_h;
      const opponentTeam = teams.find((t) => t.id === opponentId);

      // Set Difficulty
      difficulty = isHome
        ? relevantFixture.team_h_difficulty
        : relevantFixture.team_a_difficulty;

      // Set Name (UPPERCASE for Home, lowercase for Away)
      if (opponentTeam) {
        opponentDisplay = isHome
          ? opponentTeam.short_name.toUpperCase()
          : opponentTeam.short_name.toLowerCase();
      }
    } else if (gameweekId) {
      // Explicitly selected a GW, but no match found -> BLANK GW
      opponentDisplay = "BLK";
      difficulty = 0;
    }
  }

  // --- FDR COLOR HELPER ---
  const getFDRClass = (diff) => {
    if (!diff || diff === 0)
      return "bg-gray-100 dark:bg-gray-700 text-gray-400"; // Default/Blank
    if (diff <= 2) return "bg-[#01fc7a] text-black border-green-600"; // Green (Easy)
    if (diff === 3) return "bg-gray-200 text-black border-gray-300"; // Grey (Medium)
    if (diff === 4) return "bg-[#ff1751] text-white border-red-600"; // Red (Hard)
    return "bg-[#80072d] text-white border-red-900"; // Dark Red (Very Hard)
  };

  return (
    <div
      onClick={onClick}
      className="relative flex flex-col items-center cursor-pointer transition-all hover:scale-105 active:scale-95 z-10 w-16 sm:w-20 md:w-24"
    >
      <div className="relative bg-slate-500/50 backdrop-filter backdrop-blur border-slate-500 border rounded-md pt-1.5 w-full flex flex-col items-center">
        <div className="absolute top-1 right-1 flex flex-col gap-0.5">
          {/* Captaincy Badge */}
          {(isCaptain || isViceCaptain) && (
            <div className="bg-black text-white text-[9px] sm:text-[10px] font-black w-4 h-4 sm:w-4 sm:h-4 flex items-center justify-center rounded-full border border-white z-30 shadow-sm">
              {isCaptain ? "C" : "V"}
            </div>
          )}

          {/* Injury Warning Badge */}
          {isInjured && (
            <div
              className={`${badgeBg} ${badgeText} w-4 h-4 sm:w-4 sm:h-4 flex items-center justify-center rounded-full border border-white z-30 shadow-sm`}
            >
              <AlertTriangle size={12} />
            </div>
          )}
        </div>

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
          className={`relative text-center rounded-t-sm px-1 py-0.5 shadow-md z-20 border w-[95%] sm:w-full transition-colors duration-300 ${statusBg} ${
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
        </div>

        {/* --- Fixture / Difficulty Box --- */}
        <div
          className={`relative text-center rounded-b-sm px-1 py-0.5 shadow-md z-20 w-[95%] sm:w-full transition-colors duration-300 ${getFDRClass(
            difficulty
          )} ${
            inPitch
              ? "min-w-[60px] sm:min-w-[70px] md:min-w-20"
              : "min-w-[60px] sm:min-w-[70px]"
          }`}
        >
          <div className="text-[9px] sm:text-[10px] leading-none mt-0.5 font-bold">
            {opponentDisplay}
          </div>
        </div>
      </div>
    </div>
  );
}
