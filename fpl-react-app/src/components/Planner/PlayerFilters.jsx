import { useState, useEffect } from "react";
import { Search, RotateCcw, Filter } from "lucide-react";

export default function PlayerFilters({
  allPlayers,
  squad,
  onFilteredPlayersChange,
  onSortMetricChange,
  positionFilter,
  onPositionFilterChange,
}) {
  // Default States
  const defaultState = {
    search: "",
    maxPrice: 15,
    sort: "total_points",
  };

  const [filters, setFilters] = useState(defaultState);

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
    result = result.filter((p) => p.now_cost / 10 <= filters.maxPrice);

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
    setFilters(defaultState);
    onPositionFilterChange("all");
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
          <Filter size={18} /> Player Selection
        </h3>
        <button
          onClick={handleReset}
          className="text-xs flex items-center gap-1 text-red-500 hover:text-red-600 font-semibold"
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search name..."
            value={filters.search}
            onChange={(e) => handleChange("search", e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white dark:bg-gray-800 dark:text-white placeholder-gray-400"
          />
        </div>

        {/* Filters Row 1: Position & Sort */}
        <div className="grid grid-cols-2 gap-2">
          <select
            value={positionFilter}
            onChange={(e) => handleChange("position", e.target.value)}
            className="px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white dark:bg-gray-800 dark:text-white"
          >
            <option value="all">All Positions</option>
            <option value="1">Goalkeepers</option>
            <option value="2">Defenders</option>
            <option value="3">Midfielders</option>
            <option value="4">Forwards</option>
          </select>

          <select
            value={filters.sort}
            onChange={(e) => handleChange("sort", e.target.value)}
            className="px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white dark:bg-gray-800 dark:text-white"
          >
            {sortOptions.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filters Row 2: Price Slider */}
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg border border-transparent dark:border-gray-600">
          <span className="text-xs whitespace-nowrap font-medium dark:text-gray-300 w-16">
            Max £{filters.maxPrice}m
          </span>
          <input
            type="range"
            min="4"
            max="15"
            step="0.5"
            value={filters.maxPrice}
            onChange={(e) =>
              handleChange("maxPrice", parseFloat(e.target.value))
            }
            className="w-full accent-green-600 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
