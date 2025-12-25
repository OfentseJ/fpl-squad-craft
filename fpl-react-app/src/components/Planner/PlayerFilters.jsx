import { useState, useEffect, useMemo } from "react";
import { Search, RotateCcw, Filter, ArrowUpDown, Users } from "lucide-react";

export default function PlayerFilters({
  allPlayers,
  squad,
  onFilteredPlayersChange,
  onSortMetricChange,
  positionFilter,
  onPositionFilterChange,
}) {
  // 1. Calculate Dynamic Price Range from Data
  // specific logic: iterates all players to find absolute min and max costs
  const { minPrice, maxPrice } = useMemo(() => {
    if (!allPlayers || allPlayers.length === 0)
      return { minPrice: 3.5, maxPrice: 15.0 };

    let min = Infinity;
    let max = -Infinity;

    allPlayers.forEach((p) => {
      const price = p.now_cost / 10;
      if (price < min) min = price;
      if (price > max) max = price;
    });

    return { minPrice: min, maxPrice: max };
  }, [allPlayers]);

  // Default States
  const defaultState = {
    search: "",
    priceLimit: 15.0, // Renamed for clarity, defaults to high
    sort: "total_points",
  };

  const [filters, setFilters] = useState(defaultState);

  // Sync state with calculated maxPrice when data loads initially
  useEffect(() => {
    if (allPlayers.length > 0 && filters.priceLimit === 15.0) {
      setFilters((prev) => ({ ...prev, priceLimit: maxPrice }));
    }
  }, [maxPrice, allPlayers.length]);

  // Sorting Options Configuration
  const sortOptions = [
    { label: "Total Points", key: "total_points" },
    { label: "Round Points", key: "event_points" },
    { label: "Price", key: "now_cost" },
    { label: "Selected %", key: "selected_by_percent" },
    { label: "Minutes", key: "minutes" },
    { label: "Goals", key: "goals_scored" },
    { label: "Assists", key: "assists" },
    { label: "Clean Sheets", key: "clean_sheets" },
    { label: "Form", key: "form" },
    { label: "ICT Index", key: "ict_index" },
  ];

  // Logic: Filter & Sort Players
  useEffect(() => {
    if (!allPlayers) return;

    // 1. Exclude players already in squad
    const squadIds = squad.map((p) => p.id);
    let result = allPlayers.filter((p) => !squadIds.includes(p.id));

    // 2. Filter by Name
    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.web_name.toLowerCase().includes(term) ||
          p.first_name.toLowerCase().includes(term) ||
          p.second_name.toLowerCase().includes(term)
      );
    }

    // 3. Filter by Position
    if (positionFilter !== "all") {
      result = result.filter(
        (p) => p.element_type === parseInt(positionFilter)
      );
    }

    // 4. Filter by Price
    result = result.filter((p) => p.now_cost / 10 <= filters.priceLimit);

    // 5. Sort by Selected Metric (Descending)
    result.sort((a, b) => {
      const valA = parseFloat(a[filters.sort]) || 0;
      const valB = parseFloat(b[filters.sort]) || 0;
      return valB - valA;
    });

    // 6. Limit Results (Performance)
    const finalResult = result.slice(0, 50);

    // Pass data back to parent
    onFilteredPlayersChange(finalResult);
    onSortMetricChange(filters.sort);
  }, [
    allPlayers,
    squad,
    filters,
    onFilteredPlayersChange,
    onSortMetricChange,
    positionFilter,
  ]);

  // Handlers
  const handleChange = (key, value) => {
    if (key === "position") {
      onPositionFilterChange(value);
    } else {
      setFilters((prev) => ({ ...prev, [key]: value }));
    }
  };

  const handleReset = () => {
    setFilters({ ...defaultState, priceLimit: maxPrice }); // Reset to current data max
    onPositionFilterChange("all");
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-5 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Filter className="text-green-600" size={20} />
          Player Selection
        </h3>
        <button
          onClick={handleReset}
          className="text-xs flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors font-medium px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <RotateCcw size={14} /> Reset Filters
        </button>
      </div>

      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative group">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors"
          />
          <input
            type="text"
            placeholder="Search player name..."
            value={filters.search}
            onChange={(e) => handleChange("search", e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none transition-all dark:text-white dark:placeholder-gray-500"
          />
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Position Select */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
              <Users size={16} />
            </div>
            <select
              value={positionFilter}
              onChange={(e) => handleChange("position", e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 text-sm appearance-none bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500/50 outline-none dark:text-white cursor-pointer"
            >
              <option value="all">All Positions</option>
              <option value="1">Goalkeepers</option>
              <option value="2">Defenders</option>
              <option value="3">Midfielders</option>
              <option value="4">Forwards</option>
            </select>
            {/* Custom Chevron */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none border-l pl-2 border-gray-300 dark:border-gray-600">
              <span className="text-[10px] text-gray-500">▼</span>
            </div>
          </div>

          {/* Sort Select */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
              <ArrowUpDown size={16} />
            </div>
            <select
              value={filters.sort}
              onChange={(e) => handleChange("sort", e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 text-sm appearance-none bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500/50 outline-none dark:text-white cursor-pointer"
            >
              {sortOptions.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>
            {/* Custom Chevron */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none border-l pl-2 border-gray-300 dark:border-gray-600">
              <span className="text-[10px] text-gray-500">▼</span>
            </div>
          </div>
        </div>

        {/* Dynamic Price Range Slider */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700/50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Max Cost
            </span>
            <span className="text-sm font-bold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-md">
              £{filters.priceLimit.toFixed(1)}m
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 w-8 text-right">
              £{minPrice}
            </span>
            <input
              type="range"
              min={minPrice}
              max={maxPrice}
              step="0.1"
              value={filters.priceLimit}
              onChange={(e) =>
                handleChange("priceLimit", parseFloat(e.target.value))
              }
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-600 hover:accent-green-500"
            />
            <span className="text-xs text-gray-400 w-8">£{maxPrice}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
