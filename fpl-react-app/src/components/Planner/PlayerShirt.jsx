export default function PlayerShirt({ player, onClick, inPitch }) {
  const teams = player.teams || [];
  const isGK = player.element_type === 1;
  const team = teams.find((t) => t.id === player.team);

  const shirtUrl = `https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${
    team?.code || 3
  }${isGK ? "_1" : ""}-66.png`;
  return (
    <div
      onClick={onClick}
      className={`relative flex flex-col items-center cursor-pointer transition-all hover:scale-105 active:scale-95 z-10 ${
        inPitch
          ? "w-10 sm:w-12 md:w-14 lg:w-16" // Significantly smaller widths
          : "w-10 sm:w-12"
      }`}
    >
      {/* Player Shirt */}
      <div className="relative -mb-1">
        <img
          src={shirtUrl}
          alt={`${team?.short_name || ""} shirt`}
          className={`${
            inPitch
              ? "w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16"
              : "w-10 h-10 sm:w-12 sm:h-12"
          } object-contain drop-shadow-sm`}
        />
      </div>

      {/* Player Info Box */}
      <div
        className={`text-center bg-white dark:bg-gray-800 rounded-sm px-1 py-0.5 shadow-md z-20 ${
          inPitch
            ? "min-w-12 sm:min-w-14 md:min-w-16" // Tighter constraints
            : "min-w-12 sm:min-w-14"
        }`}
      >
        <div className="text-[8px] sm:text-[10px] font-bold text-gray-900 dark:text-white leading-tight truncate max-w-[55px] sm:max-w-[70px]">
          {player.web_name}
        </div>
        <div className="text-[8px] sm:text-[9px] text-gray-600 dark:text-gray-400 leading-none mt-0.5">
          £{(player.now_cost / 10).toFixed(1)}m
        </div>
      </div>
    </div>
  );
}
