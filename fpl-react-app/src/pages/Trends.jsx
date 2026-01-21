import { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Zap,
  AlertCircle,
} from "lucide-react";
import Footer from "../components/Footer";
import { useFPLApi } from "../hooks/useFPLApi"; // Adjust path if needed

// --- Helper Component: Individual Trend Widget ---
const TrendWidget = ({
  title,
  icon: Icon,
  players,
  type,
  teams,
  colorClass,
}) => {
  const { getPlayerImageUrl, getTeamBadgeUrl } = useFPLApi();

  if (!players || players.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div
        className={`p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2 ${colorClass} bg-opacity-10`}
      >
        <div className={`p-2 rounded-lg ${colorClass} text-white`}>
          <Icon size={18} />
        </div>
        <h3 className="font-bold text-lg">{title}</h3>
      </div>

      {/* List */}
      <div className="overflow-y-auto flex-1 p-2">
        {players.map((player, index) => {
          const team = teams?.find((t) => t.id === player.team);

          // Determine what value to show on the right based on widget type
          let displayValue = "";
          let displayLabel = "";
          let valueColor = "text-gray-900 dark:text-gray-100";

          switch (type) {
            case "transfers_in":
              displayValue = player.transfers_in_event.toLocaleString();
              displayLabel = "In";
              valueColor = "text-green-600";
              break;
            case "transfers_out":
              displayValue = player.transfers_out_event.toLocaleString();
              displayLabel = "Out";
              valueColor = "text-red-600";
              break;
            case "price_rise":
              displayValue = `£${(player.now_cost / 10).toFixed(1)}m`;
              displayLabel = `+£${(player.cost_change_event / 10).toFixed(1)}m`;
              valueColor = "text-green-600 font-bold";
              break;
            case "price_fall":
              displayValue = `£${(player.now_cost / 10).toFixed(1)}m`;
              displayLabel = `£${(player.cost_change_event / 10).toFixed(1)}m`;
              valueColor = "text-red-600 font-bold";
              break;
            case "form":
              displayValue = player.form;
              displayLabel = "Form";
              valueColor = "text-purple-600 font-bold";
              break;
            case "injury":
              displayValue = `${player.chance_of_playing_next_round}%`;
              displayLabel = player.status === "d" ? "Doubt" : "Injured";
              valueColor = "text-yellow-600";
              break;
            default:
              displayValue = player.total_points;
          }

          return (
            <div
              key={player.id}
              className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors border-b border-gray-50 dark:border-gray-700/50 last:border-0"
            >
              {/* Rank */}
              <span className="text-xs font-mono text-gray-400 w-4">
                {index + 1}
              </span>

              {/* Avatar */}
              <div className="relative">
                <img
                  src={getPlayerImageUrl(player.code)}
                  alt={player.web_name}
                  className="w-10 h-10 object-cover rounded-full bg-gray-100"
                  loading="lazy"
                />
                <img
                  src={getTeamBadgeUrl(team?.code)}
                  className="absolute -bottom-1 -right-1 w-4 h-4"
                  alt={team?.short_name}
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">
                  {player.web_name}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{team?.short_name}</span>
                  <span>•</span>
                  <span>
                    {player.element_type === 1
                      ? "GK"
                      : player.element_type === 2
                        ? "DEF"
                        : player.element_type === 3
                          ? "MID"
                          : "FWD"}
                  </span>
                </div>
              </div>

              {/* Metric */}
              <div className="text-right">
                <p className={`text-sm ${valueColor}`}>{displayValue}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                  {displayLabel}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function Trends({ data }) {
  // We use useMemo to process the data only when 'data' changes, avoiding re-calculations on render
  const trendData = useMemo(() => {
    if (!data?.elements) return null;

    const allPlayers = [...data.elements];

    // 1. Most Transferred In
    const transfersIn = [...allPlayers]
      .sort((a, b) => b.transfers_in_event - a.transfers_in_event)
      .slice(0, 10);

    // 2. Most Transferred Out
    const transfersOut = [...allPlayers]
      .sort((a, b) => b.transfers_out_event - a.transfers_out_event)
      .slice(0, 10);

    // 3. Price Risers (Cost Change Event > 0)
    const priceRisers = allPlayers
      .filter((p) => p.cost_change_event > 0)
      .sort(
        (a, b) =>
          b.cost_change_event - a.cost_change_event ||
          b.transfers_in_event - a.transfers_in_event,
      )
      .slice(0, 10);

    // 4. Price Fallers (Cost Change Event < 0)
    const priceFallers = allPlayers
      .filter((p) => p.cost_change_event < 0)
      .sort(
        (a, b) =>
          a.cost_change_event - b.cost_change_event ||
          b.selected_by_percent - a.selected_by_percent,
      )
      .slice(0, 10);

    // 5. Best Form
    const bestForm = [...allPlayers]
      .sort((a, b) => parseFloat(b.form) - parseFloat(a.form))
      .slice(0, 10);

    // 6. Injury Watch (High ownership but flagged)
    const injuryWatch = allPlayers
      .filter(
        (p) => p.status !== "a" && parseFloat(p.selected_by_percent) > 5.0,
      )
      .sort(
        (a, b) =>
          parseFloat(b.selected_by_percent) - parseFloat(a.selected_by_percent),
      )
      .slice(0, 10);

    return {
      transfersIn,
      transfersOut,
      priceRisers,
      priceFallers,
      bestForm,
      injuryWatch,
    };
  }, [data]);

  if (!trendData)
    return <div className="p-6 text-center">Loading trends...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <div className="p-6 flex-1">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Section */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Market Trends
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Track player movements, price changes, and form across the league.
            </p>
          </div>

          {/* Grid Layout for Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Widget 1: Most Transferred In */}
            <TrendWidget
              title="Market Hotlist"
              icon={TrendingUp}
              players={trendData.transfersIn}
              teams={data?.teams}
              type="transfers_in"
              colorClass="bg-green-500"
            />

            {/* Widget 2: Most Transferred Out */}
            <TrendWidget
              title="Market Coldlist"
              icon={TrendingDown}
              players={trendData.transfersOut}
              teams={data?.teams}
              type="transfers_out"
              colorClass="bg-red-500"
            />

            {/* Widget 3: Best Form */}
            <TrendWidget
              title="On Fire (Form)"
              icon={Zap}
              players={trendData.bestForm}
              teams={data?.teams}
              type="form"
              colorClass="bg-purple-500"
            />

            {/* Widget 4: Price Risers */}
            <TrendWidget
              title="Price Risers"
              icon={DollarSign}
              players={trendData.priceRisers}
              teams={data?.teams}
              type="price_rise"
              colorClass="bg-emerald-600"
            />

            {/* Widget 5: Price Fallers */}
            <TrendWidget
              title="Price Fallers"
              icon={DollarSign}
              players={trendData.priceFallers}
              teams={data?.teams}
              type="price_fall"
              colorClass="bg-rose-600"
            />

            {/* Widget 6: Injury Watch */}
            <TrendWidget
              title="Injury Watch (High Own%)"
              icon={AlertCircle}
              players={trendData.injuryWatch}
              teams={data?.teams}
              type="injury"
              colorClass="bg-amber-500"
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
