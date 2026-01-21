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

export default function Trends({ data }) {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showWatchlist, setShowWatchlist] = useState(false); // State for watchlist modal

  const trendData = useMemo(() => {
    if (!data?.elements) return null;

    const allPlayers = [...data.elements];

    // 1. Most Transferred In (Top 5)
    const transfersIn = [...allPlayers]
      .sort((a, b) => b.transfers_in_event - a.transfers_in_event)
      .slice(0, 5);

    // 2. Most Transferred Out (Top 5)
    const transfersOut = [...allPlayers]
      .sort((a, b) => b.transfers_out_event - a.transfers_out_event)
      .slice(0, 5);

    // 3. Price Risers (Top 5)
    const priceRisers = allPlayers
      .filter((p) => p.cost_change_event > 0)
      .sort(
        (a, b) =>
          b.cost_change_event - a.cost_change_event ||
          b.transfers_in_event - a.transfers_in_event,
      )
      .slice(0, 5);

    // 4. Price Fallers (Top 5)
    const priceFallers = allPlayers
      .filter((p) => p.cost_change_event < 0)
      .sort(
        (a, b) =>
          a.cost_change_event - b.cost_change_event ||
          b.selected_by_percent - a.selected_by_percent,
      )
      .slice(0, 5);

    // 5. Best Form (Top 5)
    const bestForm = [...allPlayers]
      .sort((a, b) => parseFloat(b.form) - parseFloat(a.form))
      .slice(0, 5);

    // 6. Differentials (Ownership < 10% && High Form)
    const differentials = allPlayers
      .filter(
        (p) =>
          parseFloat(p.selected_by_percent) < 10.0 && parseFloat(p.form) > 3.0,
      )
      .sort((a, b) => parseFloat(b.form) - parseFloat(a.form))
      .slice(0, 5);

    return {
      transfersIn,
      transfersOut,
      priceRisers,
      priceFallers,
      bestForm,
      differentials,
    };
  }, [data]);

  if (!trendData)
    return (
      <div className="p-10 text-center text-gray-500">
        Loading market trends...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <div className="p-6 md:p-8 flex-1">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Section with Watchlist Button */}
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

            {/* Watchlist Button */}
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
              onPlayerClick={setSelectedPlayer}
            />

            <TrendWidget
              title="Most Sold"
              icon={TrendingDown}
              players={trendData.transfersOut}
              teams={data?.teams}
              type="transfers_out"
              colorClass="bg-red-500"
              onPlayerClick={setSelectedPlayer}
            />

            <TrendWidget
              title="Price Risers"
              icon={DollarSign}
              players={trendData.priceRisers}
              teams={data?.teams}
              type="price_rise"
              colorClass="bg-emerald-500"
              onPlayerClick={setSelectedPlayer}
            />

            <TrendWidget
              title="Price Fallers"
              icon={DollarSign}
              players={trendData.priceFallers}
              teams={data?.teams}
              type="price_fall"
              colorClass="bg-rose-500"
              onPlayerClick={setSelectedPlayer}
            />

            <TrendWidget
              title="In Form"
              icon={Zap}
              players={trendData.bestForm}
              teams={data?.teams}
              type="form"
              colorClass="bg-orange-500"
              onPlayerClick={setSelectedPlayer}
            />

            <TrendWidget
              title="Hidden Gems"
              icon={Gem}
              players={trendData.differentials}
              teams={data?.teams}
              type="differential"
              colorClass="bg-blue-500"
              onPlayerClick={setSelectedPlayer}
            />
          </div>
        </div>
      </div>
      <Footer />

      {/* Comparison Modal */}
      {selectedPlayer && (
        <PlayerCompareModal
          player1={selectedPlayer}
          allPlayers={data?.elements || []}
          teams={data?.teams}
          onClose={() => setSelectedPlayer(null)}
        />
      )}

      {/* Watchlist Modal */}
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
