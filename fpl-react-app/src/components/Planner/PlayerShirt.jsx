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
      className={`relative flex flex-col items-center cursor-pointer transition-all hover:scale-105 z-10 ${
        inPitch ? "w-20" : "w-16"
      }`}
    >
      {/* Player Shirt */}
      <div className="relative mb-1">
        <img
          src={shirtUrl}
          className={`${inPitch ? "w-20 h-20" : "w-16 h-16"} object-contain`}
        />
      </div>

      {/* Player Info */}
      <div
        className={`text-center bg-white dark:bg-gray-800 rounded px-2 py-1 shadow-md ${
          inPitch ? "min-w-20" : "min-w-[70px]"
        }`}
      >
        <div className="text-xs font-semibold truncate">{player.web_name}</div>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          £{(player.now_cost / 10).toFixed(1)}m
        </div>
      </div>
    </div>
  );
}
