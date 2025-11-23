import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import PlayerCard from "../components/PlayerCard";

export default function Planner({ data }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("all");
  const [maxPrice, setMaxPrice] = useState(15);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);

  useEffect(() => {
    if (!data?.elements) return;

    let filtered = data.elements.filter((p) => {
      const matchesSearch =
        p.web_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.second_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPosition =
        selectedPosition === "all" ||
        p.element_type === parseInt(selectedPosition);
      const matchesPrice = p.now_cost / 10 <= maxPrice;

      return matchesSearch && matchesPosition && matchesPrice;
    });

    filtered.sort((a, b) => b.total_points - a.total_points);
    setFilteredPlayers(filtered.slice(0, 40));
  }, [data, searchTerm, selectedPosition, maxPrice]);

  const togglePlayer = (player) => {
    if (selectedPlayers.find((p) => p.id === player.id)) {
      setSelectedPlayers(selectedPlayers.filter((p) => p.id !== player.id));
    } else if (selectedPlayers.length < 15) {
      setSelectedPlayers([...selectedPlayers, player]);
    }
  };

  const totalCost =
    selectedPlayers.reduce((sum, p) => sum + p.now_cost, 0) / 10;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Squad Planner</h2>

      {/* Squad Summary */}
      <div className="bg-green-600 text-white p-6 rounded-xl mb-6 shadow-lg">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold">
              {selectedPlayers.length}/15
            </div>
            <div className="text-sm text-green-100">Players</div>
          </div>
          <div>
            <div className="text-3xl font-bold">£{totalCost.toFixed(1)}m</div>
            <div className="text-sm text-green-100">Total Cost</div>
          </div>
          <div>
            <div className="text-3xl font-bold">
              £{(100 - totalCost).toFixed(1)}m
            </div>
            <div className="text-sm text-green-100">Remaining</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow mb-6 space-y-4">
        <div className="flex items-center gap-2">
          <Search size={20} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search players..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <select
            value={selectedPosition}
            onChange={(e) => setSelectedPosition(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent"
          >
            <option value="all">All Positions</option>
            <option value="1">Goalkeepers</option>
            <option value="2">Defenders</option>
            <option value="3">Midfielders</option>
            <option value="4">Forwards</option>
          </select>

          <div className="flex items-center gap-2">
            <span className="text-sm whitespace-nowrap">Max £{maxPrice}m</span>
            <input
              type="range"
              min="4"
              max="15"
              step="0.5"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseFloat(e.target.value))}
              className="flex-1"
            />
          </div>
        </div>
      </div>

      {/* Players Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredPlayers.map((p) => (
          <PlayerCard
            key={p.id}
            player={p}
            teams={data?.teams}
            onSelect={togglePlayer}
            isSelected={!!selectedPlayers.find((sp) => sp.id === p.id)}
          />
        ))}
      </div>
    </div>
  );
}
