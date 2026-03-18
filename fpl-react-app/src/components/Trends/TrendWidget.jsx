import { Star } from "lucide-react";
import { useFPLApi } from "../../hooks/useFPLApi";
import { useWatchlist } from "../../hooks/useWatchlist";

export default function TrendWidget({
  title,
  icon: Icon,
  players,
  type,
  teams,
  colorClass,
  iconColor,
  onPlayerClick,
}) {
  const { getPlayerImageUrl, getTeamBadgeUrl } = useFPLApi();
  const { watchlist, toggleWatchlist } = useWatchlist();

  if (!players || players.length === 0) return null;

  const getPosition = (type) => {
    const roles = { 1: "GK", 2: "DEF", 3: "MID", 4: "FWD" };
    return roles[type] || "PLR";
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 flex flex-col h-full overflow-hidden transition-all hover:shadow-lg">
      {/* Header */}
      <div className="p-4 sm:p-5 flex items-center gap-3 border-b border-gray-100 dark:border-gray-700">
        <div
          className={`p-2.5 rounded-xl ${colorClass} bg-opacity-10 dark:bg-opacity-20`}
        >
          <Icon size={20} className={`${iconColor} sm:w-6 sm:h-6`} />
        </div>
        <h3 className="font-bold text-lg sm:text-xl text-gray-800 dark:text-white truncate">
          {title}
        </h3>
      </div>

      {/* List */}
      <div className="flex-1 p-2 sm:p-3 space-y-2">
        {players.map((player, index) => {
          const team = teams?.find((t) => t.id === player.team);
          const isWatched = watchlist.includes(player.id.toString());

          let displayValue = "";
          let displayLabel = "";
          let valueColor = "text-gray-900 dark:text-gray-100";

          // Optimized Logic for tight spaces
          switch (type) {
            case "transfers_in":
              displayValue =
                player.transfers_in_event > 99999
                  ? `${(player.transfers_in_event / 1000).toFixed(0)}k`
                  : player.transfers_in_event.toLocaleString();
              displayLabel = "In";
              valueColor = "text-green-600 dark:text-green-400";
              break;
            case "transfers_out":
              displayValue =
                player.transfers_out_event > 99999
                  ? `${(player.transfers_out_event / 1000).toFixed(0)}k`
                  : player.transfers_out_event.toLocaleString();
              displayLabel = "Out";
              valueColor = "text-red-600 dark:text-red-400";
              break;
            case "price_rise":
              displayValue = `£${(player.now_cost / 10).toFixed(1)}m`;
              displayLabel = `+£${(player.cost_change_event / 10).toFixed(1)}`;
              valueColor = "text-emerald-600 dark:text-emerald-400 font-bold";
              break;
            case "price_fall":
              displayValue = `£${(player.now_cost / 10).toFixed(1)}m`;
              displayLabel = `£${(player.cost_change_event / 10).toFixed(1)}`;
              valueColor = "text-rose-600 dark:text-rose-400 font-bold";
              break;
            case "injury":
              displayValue = `${player.chance_of_playing_next_round ?? 0}%`;
              displayLabel = player.status === "d" ? "Doubt" : "Out";
              valueColor = "text-amber-600 dark:text-amber-400";
              break;
            default:
              displayValue = player.form || player.total_points;
              displayLabel = "Rating";
              valueColor = "text-purple-600 dark:text-purple-400 font-bold";
          }

          return (
            <div
              key={player.id}
              className="flex items-center gap-2 sm:gap-3 p-2 bg-gray-50 dark:bg-gray-700/30 rounded-xl transition-all group relative border border-transparent hover:border-blue-100 dark:hover:border-blue-900"
            >
              {/* Rank & Star Column */}
              <div className="flex flex-col items-center gap-1 min-w-6">
                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500">
                  {index + 1}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWatchlist(player.id);
                  }}
                  className="p-1 hover:bg-white dark:hover:bg-gray-600 rounded-full transition-colors z-10"
                >
                  <Star
                    size={16}
                    className={
                      isWatched
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 dark:text-gray-600"
                    }
                  />
                </button>
              </div>

              {/* Player Image - Smaller on mobile */}
              <div
                className="relative w-12 h-12 sm:w-14 sm:h-14 shrink-0 cursor-pointer"
                onClick={() => onPlayerClick?.(player)}
              >
                <img
                  src={getPlayerImageUrl(player.code)}
                  alt={player.web_name}
                  className="w-full h-full object-contain drop-shadow-sm transition-transform group-hover:scale-105"
                  loading="lazy"
                />
                <img
                  src={getTeamBadgeUrl(team?.code)}
                  className="absolute -bottom-1 -right-1 w-5 h-5 bg-white dark:bg-gray-900 rounded-full p-0.5 shadow-sm border border-gray-100 dark:border-gray-800"
                  alt=""
                />
              </div>

              {/* Name and Info */}
              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => onPlayerClick?.(player)}
              >
                <p className="font-bold text-sm sm:text-base text-gray-900 dark:text-white truncate leading-tight">
                  {player.web_name}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-500 font-medium mt-0.5">
                  <span className="uppercase text-gray-700 dark:text-gray-400">
                    {team?.short_name}
                  </span>
                  <span className="w-0.5 h-0.5 rounded-full bg-gray-300"></span>
                  <span>{getPosition(player.element_type)}</span>
                  {type === "differential" && (
                    <span className="text-blue-500 font-bold hidden xs:inline">
                      {player.selected_by_percent}%
                    </span>
                  )}
                </div>
              </div>

              {/* Stats - Right Aligned */}
              <div className="text-right shrink-0 pl-1">
                <p
                  className={`text-sm sm:text-base font-black leading-tight ${valueColor}`}
                >
                  {displayValue}
                </p>
                <p className="text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-tighter font-bold">
                  {displayLabel}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
