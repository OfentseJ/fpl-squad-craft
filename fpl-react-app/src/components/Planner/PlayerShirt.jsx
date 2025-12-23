import { useFPLApi } from "../../hooks/useFPLApi";
import { AlertTriangle } from "lucide-react";

export default function PlayerShirt({
  player,
  onClick,
  inPitch,
  fixtures,
  gameweekId,
  highlight,
  liveData,
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

  const badgeBg = chance === 0 ? "bg-red-600" : "bg-yellow-400";
  const badgeText = chance === 0 ? "text-white" : "text-black";

  let statusBg =
    "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700";
  let statusText = "text-gray-900 dark:text-white";

  if (isInjured) {
    if (chance === 0) {
      statusBg = "bg-red-500 border-red-600";
      statusText = "text-white";
    } else {
      statusBg = "bg-yellow-400 border-yellow-500";
      statusText = "text-black";
    }
  }

  // --- GW SPECIFIC FIXTURE LOGIC (UPDATED FOR DGW) ---
  let difficulty = 0;
  let opponentDisplay = "—";
  let isMatchFinished = false;

  if (fixtures && fixtures.length > 0) {
    // 1. Get all fixtures for this player's team
    const teamFixtures = fixtures.filter(
      (f) => f.team_h === player.team || f.team_a === player.team
    );

    let activeFixtures = [];

    // 2. Filter for the specific Gameweek
    if (gameweekId) {
      activeFixtures = teamFixtures.filter((f) => f.event === gameweekId);
    } else {
      // Fallback: Find the very next fixture (Single only logic for fallback)
      const nextFix = teamFixtures.find((f) => !f.finished);
      if (nextFix) activeFixtures = [nextFix];
    }

    // 3. Process Fixtures (Handle Single or Double)
    if (activeFixtures.length > 0) {
      // Check if ALL matches in this GW are finished
      isMatchFinished = activeFixtures.every((f) => f.finished);

      const opponents = activeFixtures.map((fix) => {
        const isHome = fix.team_h === player.team;
        const opponentId = isHome ? fix.team_a : fix.team_h;
        const opponentTeam = teams.find((t) => t.id === opponentId);
        const shortName = opponentTeam ? opponentTeam.short_name : "???";

        // Return object for calculating combined difficulty later
        return {
          display: isHome ? shortName.toUpperCase() : shortName.toLowerCase(),
          diff: isHome ? fix.team_h_difficulty : fix.team_a_difficulty,
        };
      });

      // A. Display Text
      // Join multiple opponents with a comma
      opponentDisplay = opponents.map((o) => o.display).join(", ");

      // B. Difficulty
      // If DGW, we take the average difficulty rounded up? Or max?
      // Usually showing the 'hardest' color warns the user better,
      // OR we can Average. Let's Average for a balanced heatmap look.
      const totalDiff = opponents.reduce((sum, o) => sum + o.diff, 0);
      difficulty = Math.round(totalDiff / opponents.length);
    } else if (gameweekId) {
      // Explicit blank GW
      opponentDisplay = "BLK";
      difficulty = 0;
    }
  }

  // --- FDR COLOR HELPER ---
  const getFDRClass = (diff) => {
    if (!diff || diff === 0)
      return "bg-gray-100 dark:bg-gray-700 text-gray-400"; // Blank/Empty
    if (diff <= 2) return "bg-[#01fc7a] text-black border-green-600";
    if (diff === 3) return "bg-gray-200 text-black border-gray-300";
    if (diff === 4) return "bg-[#ff1751] text-white border-red-600";
    return "bg-[#80072d] text-white border-red-900";
  };

  // --- LIVE POINTS LOGIC ---
  let bottomBoxContent = opponentDisplay;
  let bottomBoxClass = getFDRClass(difficulty);

  // Font sizing adjustment for DGW text
  // If the text is long (e.g. "ARS, CHE"), make font smaller
  const isDGW = bottomBoxContent.includes(",");
  const fontSizeClass = isDGW
    ? "text-[8px] sm:text-[9px]"
    : "text-[9px] sm:text-[10px]";

  if (liveData) {
    const hasPlayed = liveData.minutes > 0 || liveData.total_points !== 0;

    // In DGW, we show points if ANY match has started (minutes > 0)
    if (hasPlayed || isMatchFinished) {
      let points = liveData.total_points;
      if (isCaptain) points = points * 2;

      bottomBoxContent = `${points} Pts`;

      if (points === 0 && isMatchFinished && !hasPlayed) {
        bottomBoxClass =
          "bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-300 border-gray-300 dark:border-gray-500";
      } else {
        bottomBoxClass =
          "bg-white dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600 font-bold border-2";
      }
    }
  }

  // --- DYNAMIC CARD STYLE ---
  const cardStyle = highlight
    ? "bg-slate-500/60 border-yellow-400 border-2 shadow-[0_0_10px_rgba(250,204,21,0.5)] scale-105"
    : "bg-slate-500/50 border-slate-500 border";

  return (
    <div
      onClick={onClick}
      className={`relative flex flex-col items-center cursor-pointer transition-all hover:scale-105 active:scale-95 z-10 w-16 sm:w-20 md:w-24`}
    >
      <div
        className={`relative backdrop-filter backdrop-blur rounded-md pt-1.5 w-full flex flex-col items-center transition-all duration-300 ${cardStyle}`}
      >
        <div className="absolute top-1 right-1 flex flex-col gap-0.5">
          {(isCaptain || isViceCaptain) && (
            <div className="bg-black text-white text-[9px] sm:text-[10px] font-black w-4 h-4 sm:w-4 sm:h-4 flex items-center justify-center rounded-full border border-white z-30 shadow-sm">
              {isCaptain ? "C" : "V"}
            </div>
          )}

          {isInjured && (
            <div
              className={`${badgeBg} ${badgeText} w-4 h-4 sm:w-4 sm:h-4 flex items-center justify-center rounded-full border border-white z-30 shadow-sm`}
            >
              <AlertTriangle size={12} />
            </div>
          )}
        </div>

        <div className="-mb-4 sm:-mb-5 z-10">
          <img
            src={shirtUrl}
            alt={`${team?.short_name || ""} shirt`}
            className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain drop-shadow-sm"
          />
        </div>

        <div
          className={`relative text-center rounded-t-sm px-1 py-0.5 shadow-md z-20 border w-[95%] sm:w-full transition-colors duration-300 ${statusBg} ${
            inPitch
              ? "min-w-15 sm:min-w-17.5 md:min-w-20"
              : "min-w-15 sm:min-w-17.5"
          }`}
        >
          <div
            className={`text-[10px] sm:text-xs font-bold leading-tight truncate px-0.5 ${statusText}`}
          >
            {player.web_name}
          </div>
        </div>

        <div
          className={`relative text-center rounded-b-sm px-1 py-0.5 shadow-md z-20 w-[95%] sm:w-full transition-colors duration-300 ${bottomBoxClass} ${
            inPitch
              ? "min-w-15 sm:min-w-17.5 md:min-w-20"
              : "min-w-15 sm:min-w-17.5"
          }`}
        >
          {/* Apply dynamic font size class here */}
          <div className={`${fontSizeClass} leading-none mt-0.5 font-bold`}>
            {bottomBoxContent}
          </div>
        </div>
      </div>
    </div>
  );
}
