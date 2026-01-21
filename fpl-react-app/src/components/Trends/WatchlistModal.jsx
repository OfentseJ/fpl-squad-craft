import { X, Trash2, ArrowRight } from "lucide-react";
import { useFPLApi } from "../../hooks/useFPLApi";
import { useWatchlist } from "../../hooks/useWatchList";

export default function WatchlistModal({
  allPlayers,
  teams,
  onClose,
  onPlayerClick,
}) {
  const { watchlist, toggleWatchlist } = useWatchlist();
  const { getPlayerImageUrl, getTeamBadgeUrl } = useFPLApi();

  // Filter full player objects based on watchlist IDs
  const watchedPlayers = allPlayers.filter((p) =>
    watchlist.includes(p.id.toString()),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
          <div>
            <h3 className="font-bold text-xl text-gray-900 dark:text-white">
              My Watchlist
            </h3>
            <p className="text-sm text-gray-500">
              {watchedPlayers.length} players tracked
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 p-4 space-y-2">
          {watchedPlayers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400 text-center">
              <p>Your watchlist is empty.</p>
              <p className="text-sm mt-1">Star players to track them here.</p>
            </div>
          ) : (
            watchedPlayers.map((player) => {
              const team = teams?.find((t) => t.id === player.team);

              return (
                <div
                  key={player.id}
                  onClick={() => {
                    onPlayerClick(player); // Open comparison modal
                    onClose(); // Close watchlist modal
                  }}
                  className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all cursor-pointer group border border-transparent hover:border-gray-100 dark:hover:border-gray-700"
                >
                  {/* Avatar */}
                  <div className="relative w-12 h-12 shrink-0">
                    <img
                      src={getPlayerImageUrl(player.code)}
                      alt={player.web_name}
                      className="w-full h-full object-contain"
                    />
                    <img
                      src={getTeamBadgeUrl(team?.code)}
                      className="absolute -bottom-1 -right-1 w-4 h-4 bg-white dark:bg-gray-900 rounded-full p-0.5"
                      alt={team?.short_name}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white truncate">
                      {player.web_name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{team?.short_name}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <span>£{(player.now_cost / 10).toFixed(1)}m</span>
                    </div>
                  </div>

                  {/* Stats Snippet */}
                  <div className="hidden sm:block text-right mr-2">
                    <p className="text-xs text-gray-400 uppercase">Points</p>
                    <p className="font-mono font-bold text-sm">
                      {player.total_points}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWatchlist(player.id);
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Remove from watchlist"
                    >
                      <Trash2 size={18} />
                    </button>
                    <ArrowRight
                      size={16}
                      className="text-gray-300 group-hover:text-blue-500 transition-colors"
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 text-center">
          <button
            onClick={onClose}
            className="text-sm font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
