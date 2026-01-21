import { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Zap,
  Gem,
  Star,
} from "lucide-react";
import Footer from "../components/Footer";
import TrendWidget from "../components/Trends/TrendWidget";
import PlayerCompareModal from "../components/PlayerCompareModal";
import WatchlistModal from "../components/Trends/WatchlistModal";
import TrendSkeleton from "../components/Skeletons/TrendSkeleton"; // Import Skeleton

export default function Trends({ data }) {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showWatchlist, setShowWatchlist] = useState(false);

  const trendData = useMemo(() => {
    if (!data?.elements) return null;

    const allPlayers = [...data.elements];

    // Helper for safe sorting
    const safeSort = (arr, sortFn) => [...arr].sort(sortFn).slice(0, 5);

    return {
      transfersIn: safeSort(
        allPlayers,
        (a, b) => b.transfers_in_event - a.transfers_in_event,
      ),
      transfersOut: safeSort(
        allPlayers,
        (a, b) => b.transfers_out_event - a.transfers_out_event,
      ),
      priceRisers: safeSort(
        allPlayers.filter((p) => p.cost_change_event > 0),
        (a, b) =>
          b.cost_change_event - a.cost_change_event ||
          b.transfers_in_event - a.transfers_in_event,
      ),
      priceFallers: safeSort(
        allPlayers.filter((p) => p.cost_change_event < 0),
        (a, b) =>
          a.cost_change_event - b.cost_change_event ||
          b.selected_by_percent - a.selected_by_percent,
      ),
      bestForm: safeSort(
        allPlayers,
        (a, b) => parseFloat(b.form) - parseFloat(a.form),
      ),
      differentials: safeSort(
        allPlayers.filter(
          (p) =>
            parseFloat(p.selected_by_percent) < 10.0 &&
            parseFloat(p.form) > 3.0,
        ),
        (a, b) => parseFloat(b.form) - parseFloat(a.form),
      ),
    };
  }, [data]);

  // LOADING STATE: Show Skeleton Grid
  if (!trendData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <div className="p-6 md:p-8 flex-1">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header Skeleton */}
            <div className="space-y-4 animate-pulse">
              <div className="h-10 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
              <div className="h-6 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
            </div>

            {/* Grid of Skeletons */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <TrendSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <div className="p-6 md:p-8 flex-1">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Market Trends
              </h2>
              <p className="text-lg text-gray-500 dark:text-gray-400 mt-2">
                Live market data for Gameweek{" "}
                {data?.events?.find((e) => e.is_current)?.id || "Next"}
              </p>
            </div>

            <button
              onClick={() => setShowWatchlist(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-yellow-400 dark:hover:border-yellow-500 text-gray-700 dark:text-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all font-semibold"
            >
              <Star size={18} className="text-yellow-500 fill-yellow-500" />
              My Watchlist
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TrendWidget
              title="Most Bought"
              icon={TrendingUp}
              players={trendData.transfersIn}
              teams={data?.teams}
              type="transfers_in"
              colorClass="bg-green-500"
              iconColor="text-green-500"
              onPlayerClick={setSelectedPlayer}
            />

            <TrendWidget
              title="Most Sold"
              icon={TrendingDown}
              players={trendData.transfersOut}
              teams={data?.teams}
              type="transfers_out"
              colorClass="bg-red-500"
              iconColor="text-red-500"
              onPlayerClick={setSelectedPlayer}
            />

            <TrendWidget
              title="Price Risers"
              icon={DollarSign}
              players={trendData.priceRisers}
              teams={data?.teams}
              type="price_rise"
              colorClass="bg-emerald-500"
              iconColor="text-emerald-500"
              onPlayerClick={setSelectedPlayer}
            />

            <TrendWidget
              title="Price Fallers"
              icon={DollarSign}
              players={trendData.priceFallers}
              teams={data?.teams}
              type="price_fall"
              colorClass="bg-rose-500"
              iconColor="text-rose-500"
              onPlayerClick={setSelectedPlayer}
            />

            <TrendWidget
              title="In Form"
              icon={Zap}
              players={trendData.bestForm}
              teams={data?.teams}
              type="form"
              colorClass="bg-orange-500"
              iconColor="text-orange-500"
              onPlayerClick={setSelectedPlayer}
            />

            <TrendWidget
              title="Hidden Gems"
              icon={Gem}
              players={trendData.differentials}
              teams={data?.teams}
              type="differential"
              colorClass="bg-blue-500"
              iconColor="text-blue-500"
              onPlayerClick={setSelectedPlayer}
            />
          </div>
        </div>
      </div>
      <Footer />

      {selectedPlayer && (
        <PlayerCompareModal
          player1={selectedPlayer}
          allPlayers={data?.elements || []}
          teams={data?.teams}
          onClose={() => setSelectedPlayer(null)}
        />
      )}

      {showWatchlist && (
        <WatchlistModal
          allPlayers={data?.elements || []}
          teams={data?.teams}
          onClose={() => setShowWatchlist(false)}
          onPlayerClick={setSelectedPlayer}
        />
      )}
    </div>
  );
}
