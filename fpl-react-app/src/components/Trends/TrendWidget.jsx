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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col h-full overflow-hidden transition-all hover:shadow-xl">
      {/* Header */}
      <div className="p-5 flex items-center gap-3 border-b border-gray-100 dark:border-gray-700">
        <div
          className={`p-3 rounded-xl ${colorClass} bg-opacity-10 dark:bg-opacity-20`}
        >
          {/* We apply the explicit text color class here */}
          <Icon size={24} className={iconColor} />
        </div>
        <h3 className="font-bold text-xl text-gray-800 dark:text-white">
          {title}
        </h3>
      </div>

      {/* List */}
      <div className="flex-1 p-3 space-y-2">
        {players.map((player, index) => {
          const team = teams?.find((t) => t.id === player.team);
          // Check watchlist directly from the array for instant reactivity
          const isWatched = watchlist.includes(player.id.toString());

          // Determine display logic
          let displayValue = "";
          let displayLabel = "";
          let valueColor = "text-gray-900 dark:text-gray-100";

          switch (type) {
            case "transfers_in":
              displayValue = player.transfers_in_event.toLocaleString();
              displayLabel = "Transfers In";
              valueColor = "text-green-600 dark:text-green-400";
              break;
            case "transfers_out":
              displayValue = player.transfers_out_event.toLocaleString();
              displayLabel = "Transfers Out";
              valueColor = "text-red-600 dark:text-red-400";
              break;
            case "price_rise":
              displayValue = `£${(player.now_cost / 10).toFixed(1)}m`;
              displayLabel = `+£${(player.cost_change_event / 10).toFixed(1)}m`;
              valueColor = "text-emerald-600 dark:text-emerald-400 font-bold";
              break;
            case "price_fall":
              displayValue = `£${(player.now_cost / 10).toFixed(1)}m`;
              displayLabel = `£${(player.cost_change_event / 10).toFixed(1)}m`;
              valueColor = "text-rose-600 dark:text-rose-400 font-bold";
              break;
            case "form":
            case "differential":
              displayValue = player.form;
              displayLabel = "Form Rating";
              valueColor = "text-purple-600 dark:text-purple-400 font-bold";
              break;
            case "injury":
              displayValue = `${player.chance_of_playing_next_round}%`;
              displayLabel = player.status === "d" ? "Doubtful" : "Injured";
              valueColor = "text-amber-600 dark:text-amber-400";
              break;
            default:
              displayValue = player.total_points;
          }

          return (
            <div
              key={player.id}
              className="flex items-center gap-3 p-2 pr-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl transition-all group relative"
            >
              <span className="text-sm font-bold text-gray-400 dark:text-gray-500 w-5 text-center shrink-0">
                {index + 1}
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWatchlist(player.id);
                }}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors shrink-0 z-10"
              >
                <Star
                  size={18}
                  className={`${
                    isWatched
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300 dark:text-gray-600 group-hover:text-gray-400"
                  } transition-colors`}
                />
              </button>

              <div
                onClick={() => onPlayerClick && onPlayerClick(player)}
                className="relative w-16 h-16 shrink-0 cursor-pointer"
              >
                <img
                  src={getPlayerImageUrl(player.code)}
                  alt={player.web_name}
                  className="w-full h-full object-contain drop-shadow-md transition-transform group-hover:scale-110"
                  loading="lazy"
                />
                <img
                  src={getTeamBadgeUrl(team?.code)}
                  className="absolute bottom-0 right-0 w-5 h-5 bg-white dark:bg-gray-900 rounded-full p-0.5 shadow-sm"
                  alt={team?.short_name}
                />
              </div>

              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => onPlayerClick && onPlayerClick(player)}
              >
                <p className="font-bold text-base text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {player.web_name}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                  <span className="uppercase">{team?.short_name}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span>
                    {player.element_type === 1
                      ? "GK"
                      : player.element_type === 2
                        ? "DEF"
                        : player.element_type === 3
                          ? "MID"
                          : "FWD"}
                  </span>
                  {type === "differential" && (
                    <span className="text-blue-500 ml-1">
                      ({player.selected_by_percent}%)
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className={`text-lg font-bold leading-tight ${valueColor}`}>
                  {displayValue}
                </p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
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
