import { useFPLApi } from "../../hooks/useFPLApi";

export default function PlayerShirt({ player, onClick, inPitch, fixtures }) {
  const teams = player.teams || [];
  const isGK = player.element_type === 1;
  const team = teams.find((t) => t.id === player.team);
  const { getShirtUrl } = useFPLApi();

  const shirtUrl = getShirtUrl(team, isGK);

  // Get next opponent from fixtures
  const getNextOpponent = () => {
    if (!fixtures || fixtures.length === 0) return "—";

    // Find next fixture for this player's team
    const nextFixture = fixtures.find(
      (f) =>
        !f.finished && (f.team_h === player.team || f.team_a === player.team)
    );

    if (!nextFixture) return "—";

    const isHome = nextFixture.team_h === player.team;
    const opponentId = isHome ? nextFixture.team_a : nextFixture.team_h;
    const opponentTeam = teams.find((t) => t.id === opponentId);

    if (!opponentTeam) return "—";

    // Capitalize if home, lowercase if away
    return isHome
      ? opponentTeam.short_name.toUpperCase()
      : opponentTeam.short_name.toLowerCase();
  };

  return (
    <div
      onClick={onClick}
      className={`relative flex flex-col items-center cursor-pointer transition-all hover:scale-105 active:scale-95 z-10 ${
        inPitch ? "w-12 sm:w-14 md:w-16 lg:w-20" : "w-12 sm:w-14"
      }`}
    >
      {/* Player Shirt */}
      <div className="relative -mb-1">
        <img
          src={shirtUrl}
          alt={`${team?.short_name || ""} shirt`}
          className={`${
            inPitch
              ? "w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20"
              : "w-12 h-12 sm:w-14 sm:h-14"
          } object-contain drop-shadow-sm`}
        />
      </div>

      {/* Player Info Box */}
      <div
        className={`text-center bg-white dark:bg-gray-800 rounded-sm px-1 py-0.5 shadow-md z-20 border border-gray-100 dark:border-gray-700 ${
          inPitch
            ? "min-w-[52px] sm:min-w-[60px] md:min-w-[70px]"
            : "min-w-[52px] sm:min-w-[60px]"
        }`}
      >
        <div className="text-[9px] sm:text-[10px] md:text-xs font-bold text-gray-900 dark:text-white leading-tight truncate max-w-[50px] sm:max-w-[65px] md:max-w-20 mx-auto">
          {player.web_name}
        </div>
        <div className="text-[8px] sm:text-[9px] md:text-[10px] text-gray-600 dark:text-gray-400 leading-none mt-0.5">
          {getNextOpponent()}
        </div>
      </div>
    </div>
  );
}
