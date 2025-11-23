export default function PlayerShirt({ player, onClick, inPitch }) {
  const photo = player.photo ? player.photo.replace(".jpg", "") : null;
  const teams = player.teams;
  const isGK = player.element_type === 1;
  const team = teams.find((t) => t.id === player.team);
  const playerImageUrl = photo
    ? `https://resources.premierleague.com/premierleague/photos/players/250x250/p${photo}.png`
    : null;
  const shirtUrl = `https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${
    team.code
  }${isGK ? "_1" : ""}-110.png`;

  return (
    <div
      onClick={onClick}
      className={`relative flex flex-col items-center cursor-pointer transition-all hover:scale-105 active:scale-95 z-10 ${
        inPitch ? "w-14 sm:w-16 md:w-20" : "w-12 sm:w-14"
      }`}
    >
      {/* Player Shirt */}
      <div className="relative mb-1">
        <img
          src={shirtUrl}
          alt={`${team?.short_name} ${isGK ? "GK" : ""} shirt`}
          className={`${
            inPitch
              ? "w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20"
              : "w-12 h-12 sm:w-14 sm:h-14"
          } object-contain`}
        />
      </div>

      {/* Player Info */}
      <div
        className={`text-center bg-white dark:bg-gray-800 rounded px-1.5 py-0.5 sm:px-2 sm:py-1 shadow-md ${
          inPitch ? "min-w-14 sm:min-w-16 md:min-w-20" : "min-w-12 sm:min-w-14"
        }`}
      >
        <div className="text-[10px] sm:text-xs font-semibold truncate max-w-[60px] sm:max-w-20">
          {player.web_name}
        </div>
        <div className="text-[9px] sm:text-xs text-gray-600 dark:text-gray-400">
          £{(player.now_cost / 10).toFixed(1)}m
        </div>
      </div>
    </div>
  );
}
