import { Star } from "lucide-react";

export default function PlayerCard({ player, teams, onSelect, isSelected }) {
  const team = teams?.find((t) => t.id === player.team);
  const positionMap = { 1: "GKP", 2: "DEF", 3: "MID", 4: "FWD" };

  return (
    <div
      onClick={() => onSelect?.(player)}
      className={`p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all ${
        onSelect ? "cursor-pointer" : ""
      } ${isSelected ? "ring-2 ring-green-500" : ""}`}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-lg">{player.web_name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {team?.short_name} • {positionMap[player.element_type]}
          </p>
        </div>
        {isSelected && (
          <Star className="text-green-500 fill-current" size={20} />
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-600 dark:text-gray-400">Price:</span>
          <span className="font-semibold ml-1">
            £{(player.now_cost / 10).toFixed(1)}m
          </span>
        </div>
        <div>
          <span className="text-gray-600 dark:text-gray-400">Points:</span>
          <span className="font-semibold ml-1">{player.total_points}</span>
        </div>
        <div>
          <span className="text-gray-600 dark:text-gray-400">Form:</span>
          <span className="font-semibold ml-1">{player.form}</span>
        </div>
        <div>
          <span className="text-gray-600 dark:text-gray-400">Selected:</span>
          <span className="font-semibold ml-1">
            {player.selected_by_percent}%
          </span>
        </div>
      </div>
    </div>
  );
}
