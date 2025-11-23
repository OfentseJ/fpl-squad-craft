import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import Pitch from "../components/Planner/Pitch";

function FormationPicker({ formation, onChange }) {
  const formations = [
    { name: "3-4-3", def: 3, mid: 4, fwd: 3 },
    { name: "3-5-2", def: 3, mid: 5, fwd: 2 },
    { name: "4-3-3", def: 4, mid: 3, fwd: 3 },
    { name: "4-4-2", def: 4, mid: 4, fwd: 2 },
    { name: "4-5-1", def: 4, mid: 5, fwd: 1 },
    { name: "5-3-2", def: 5, mid: 3, fwd: 2 },
    { name: "5-4-1", def: 5, mid: 4, fwd: 1 },
  ];

  return (
    <div className="flex gap-2 flex-wrap justify-center">
      {formations.map((f) => (
        <button
          key={f.name}
          onClick={() => onChange(f)}
          className={`px-3 py-2 rounded-lg font-semibold transition-all ${
            formation.name === f.name
              ? "bg-green-600 text-white"
              : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          {f.name}
        </button>
      ))}
    </div>
  );
}

export default function Planner({ data }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("all");
  const [maxPrice, setMaxPrice] = useState(15);
  const [squad, setSquad] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [formation, setFormation] = useState({
    name: "4-4-2",
    def: 4,
    mid: 4,
    fwd: 2,
  });
  const [view, setView] = useState("pitch");

  useEffect(() => {
    if (!data?.elements) return;

    const selectedIds = squad.map((p) => p.id);
    let filtered = data.elements.filter((p) => !selectedIds.includes(p.id));

    filtered = filtered.filter((p) => {
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
  }, [data, searchTerm, selectedPosition, maxPrice, squad]);

  const addPlayer = (player) => {
    if (squad.length >= 15) return;

    const posCount = { 1: 0, 2: 0, 3: 0, 4: 0 };
    squad.forEach((p) => posCount[p.element_type]++);

    if (player.element_type === 1 && posCount[1] >= 2) return;
    if (player.element_type === 2 && posCount[2] >= 5) return;
    if (player.element_type === 3 && posCount[3] >= 5) return;
    if (player.element_type === 4 && posCount[4] >= 3) return;

    const teamCount = squad.filter((p) => p.team === player.team).length;
    if (teamCount >= 3) return;

    let starting = false;
    const startingCount = squad.filter((p) => p.starting).length;

    if (startingCount < 11) {
      if (player.element_type === 1 && posCount[1] === 0) starting = true;
      else if (
        player.element_type === 2 &&
        squad.filter((p) => p.starting && p.element_type === 2).length <
          formation.def
      )
        starting = true;
      else if (
        player.element_type === 3 &&
        squad.filter((p) => p.starting && p.element_type === 3).length <
          formation.mid
      )
        starting = true;
      else if (
        player.element_type === 4 &&
        squad.filter((p) => p.starting && p.element_type === 4).length <
          formation.fwd
      )
        starting = true;
    }
    setSquad([...squad, { ...player, starting, teams: data.teams }]);
  };

  const removePlayer = (playerId) => {
    setSquad(squad.filter((p) => p.id !== playerId));
  };

  const totalCost = squad.reduce((sum, p) => sum + p.now_cost, 0) / 10;
  const startingCount = squad.filter((p) => p.starting).length;

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-4 text-center">Squad Builder</h2>

      <div className="bg-linear-to-r from-purple-600 to-green-600 text-white p-6 rounded-xl mb-6 shadow-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold">{squad.length}/15</div>
            <div className="text-sm text-white/80">Squad</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{startingCount}/11</div>
            <div className="text-sm text-white/80">Starting XI</div>
          </div>
          <div>
            <div className="text-3xl font-bold">£{totalCost.toFixed(1)}m</div>
            <div className="text-sm text-white/80">Total Cost</div>
          </div>
          <div>
            <div className="text-3xl font-bold">
              £{(100 - totalCost).toFixed(1)}m
            </div>
            <div className="text-sm text-white/80">Remaining</div>
          </div>
        </div>
      </div>

      {squad.length >= 11 && (
        <div className="mb-6">
          <h3 className="text-center font-semibold mb-3">Formation</h3>
          <FormationPicker formation={formation} onChange={setFormation} />
        </div>
      )}

      <div className="flex justify-center gap-2 mb-6">
        <button
          onClick={() => setView("pitch")}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
            view === "pitch"
              ? "bg-green-600 text-white"
              : "bg-gray-200 dark:bg-gray-700"
          }`}
        >
          Pitch View
        </button>
        <button
          onClick={() => setView("list")}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
            view === "list"
              ? "bg-green-600 text-white"
              : "bg-gray-200 dark:bg-gray-700"
          }`}
        >
          List View
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {view === "pitch" ? (
            <Pitch
              squad={squad}
              formation={formation}
              onRemovePlayer={removePlayer}
            />
          ) : (
            <div className="space-y-3">
              {squad.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={`https://resources.premierleague.com/premierleague/badges/t${
                        data.teams.find((t) => t.id === p.team)?.code
                      }.png`}
                      alt="badge"
                      className="w-8 h-8"
                      onError={(e) => (e.target.style.display = "none")}
                    />
                    <div>
                      <div className="font-semibold">{p.web_name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        £{(p.now_cost / 10).toFixed(1)}m •{" "}
                        {p.starting ? "Starting XI" : "Bench"}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removePlayer(p.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sticky top-4">
            <h3 className="font-semibold mb-4 text-center">Add Players</h3>
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2">
                <Search size={18} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent text-sm"
                />
              </div>

              <select
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent text-sm"
              >
                <option className="bg-white dark:bg-gray-800" value="all">
                  All Positions
                </option>
                <option className="bg-white dark:bg-gray-800" value="1">
                  Goalkeepers
                </option>
                <option className="bg-white dark:bg-gray-800" value="2">
                  Defenders
                </option>
                <option className="bg-white dark:bg-gray-800" value="3">
                  Midfielders
                </option>
                <option className="bg-white dark:bg-gray-800" value="4">
                  Forwards
                </option>
              </select>

              <div className="flex items-center gap-2">
                <span className="text-xs whitespace-nowrap">
                  Max £{maxPrice}m
                </span>
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

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredPlayers.map((p) => (
                <div
                  key={p.id}
                  onClick={() => addPlayer(p)}
                  className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-sm">{p.web_name}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {data.teams.find((t) => t.id === p.team)?.short_name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-sm">
                        £{(p.now_cost / 10).toFixed(1)}m
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {p.total_points} pts
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
