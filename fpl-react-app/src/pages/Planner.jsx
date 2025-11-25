import { useState, useEffect } from "react";
import { Search, Users } from "lucide-react";
import Pitch from "../components/Planner/Pitch"; // Ensure path is correct
import { useFPLApi } from "../hooks/useFPLApi";

// Formation Picker
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
    <div className="flex gap-1 sm:gap-2 flex-wrap justify-center">
      {formations.map((f) => (
        <button
          key={f.name}
          onClick={() => onChange(f)}
          className={`px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm rounded-lg font-semibold transition-all ${
            formation.name === f.name
              ? "bg-green-600 text-white shadow-md scale-105"
              : "bg-white dark:bg-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
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
  const { getShirtUrl } = useFPLApi();

  // Helper: Check if a specific position is full
  const isPositionFull = (elementType) => {
    const count = squad.filter((p) => p.element_type === elementType).length;
    if (elementType === 1) return count >= 2;
    if (elementType === 2) return count >= 5;
    if (elementType === 3) return count >= 5;
    if (elementType === 4) return count >= 3;
    return false;
  };

  // Helper: Check if a specific team limit is reached
  const isTeamFull = (teamId) => {
    return squad.filter((p) => p.team === teamId).length >= 3;
  };

  useEffect(() => {
    if (!data?.elements) return;

    // Filter Logic
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
    setFilteredPlayers(filtered.slice(0, 50));
  }, [data, searchTerm, selectedPosition, maxPrice, squad]);

  const addPlayer = (player) => {
    if (squad.length >= 15) return;
    if (isPositionFull(player.element_type)) return;
    if (isTeamFull(player.team)) return;
    setSquad([...squad, { ...player, starting: true, teams: data.teams }]);
  };

  const removePlayer = (playerId) => {
    setSquad(squad.filter((p) => p.id !== playerId));
  };

  const handlePlaceholderClick = (positionId) => {
    setSelectedPosition(positionId.toString());
    const listElement = document.getElementById("player-list-section");
    if (listElement) listElement.scrollIntoView({ behavior: "smooth" });
  };

  const totalCost = squad.reduce((sum, p) => sum + p.now_cost, 0) / 10;
  const substitutePlayers = (player1Id, player2Id) => {
    setSquad(
      squad.map((p) => {
        if (p.id === player1Id) {
          return { ...p, starting: !p.starting };
        }
        if (p.id === player2Id) {
          return { ...p, starting: !p.starting };
        }
        return p;
      })
    );
  };

  return (
    <div className="p-2 sm:p-4 max-w-7xl mx-auto font-sans dark:text-white">
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-center flex items-center justify-center gap-2">
        <Users className="w-6 h-6 sm:w-8 sm:h-8" /> Squad Builder
      </h2>

      {/* Summary Banner */}
      <div className="bg-linear-to-r from-slate-800 to-slate-900 text-white p-4 rounded-xl mb-6 shadow-lg border-t-4 border-green-500">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-xl sm:text-2xl font-bold">
              {squad.length}/15
            </div>
            <div className="text-[10px] sm:text-xs text-gray-400 uppercase">
              Squad
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-green-400">
              £{totalCost.toFixed(1)}m
            </div>
            <div className="text-[10px] sm:text-xs text-gray-400 uppercase">
              Cost
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold">
              £{(100 - totalCost).toFixed(1)}m
            </div>
            <div className="text-[10px] sm:text-xs text-gray-400 uppercase">
              Bank
            </div>
          </div>
        </div>
      </div>

      {/* Formation & View Toggles */}
      <div className="mb-6 space-y-4">
        <div className="flex justify-center">
          <FormationPicker formation={formation} onChange={setFormation} />
        </div>

        <div className="flex justify-center gap-2">
          <button
            onClick={() => setView("pitch")}
            className={`px-4 py-1.5 text-sm rounded-full font-medium transition-colors ${
              view === "pitch"
                ? "bg-green-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Pitch
          </button>
          <button
            onClick={() => setView("list")}
            className={`px-4 py-1.5 text-sm rounded-full font-medium transition-colors ${
              view === "list"
                ? "bg-green-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            List
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COL: PITCH or LIST VIEW */}
        <div className="lg:col-span-2 order-1 lg:order-1">
          {view === "pitch" ? (
            <Pitch
              squad={squad}
              formation={formation}
              onRemovePlayer={removePlayer}
              onPlaceholderClick={handlePlaceholderClick}
              onSubstitutePlayers={substitutePlayers}
            />
          ) : (
            <div className="space-y-2">
              {/* Simplified List View of Selected Squad */}
              {squad.length === 0 && (
                <div className="text-center text-gray-400 py-10">
                  No players selected.
                </div>
              )}
              {squad.map((p) => (
                <div
                  key={p.id}
                  className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded shadow border-l-4 border-green-500"
                >
                  <span className="font-bold text-gray-800 dark:text-white">
                    {p.web_name}
                  </span>
                  <button
                    onClick={() => removePlayer(p.id)}
                    className="text-red-500 text-sm underline hover:text-red-400"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COL: PLAYER SELECTOR */}
        <div
          id="player-list-section"
          className="lg:col-span-1 order-2 lg:order-2"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden sticky top-4 border border-gray-100 dark:border-gray-700">
            {/* Header & Filters */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-lg mb-3 dark:text-white">
                Player Selection
              </h3>

              <div className="space-y-3">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white dark:bg-gray-800 dark:text-white placeholder-gray-400"
                  />
                </div>

                <div className="flex gap-2">
                  <select
                    value={selectedPosition}
                    onChange={(e) => setSelectedPosition(e.target.value)}
                    className="flex-1 px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white dark:bg-gray-800 dark:text-white"
                  >
                    <option value="all">All Positions</option>
                    <option value="1">Goalkeepers</option>
                    <option value="2">Defenders</option>
                    <option value="3">Midfielders</option>
                    <option value="4">Forwards</option>
                  </select>
                  <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-2 rounded-lg border border-transparent dark:border-gray-600">
                    <span className="text-xs whitespace-nowrap font-medium dark:text-gray-300">
                      £{maxPrice}m
                    </span>
                    <input
                      type="range"
                      min="4"
                      max="15"
                      step="0.5"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(parseFloat(e.target.value))}
                      className="w-16 accent-green-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* List Items */}
            <div className="max-h-[500px] overflow-y-auto p-2 space-y-1 bg-white dark:bg-gray-800">
              {filteredPlayers.map((p) => {
                const posFull = isPositionFull(p.element_type);
                const teamFull = isTeamFull(p.team);
                const isDisabled = posFull || teamFull;

                return (
                  <button
                    key={p.id}
                    onClick={() => !isDisabled && addPlayer(p)}
                    disabled={isDisabled}
                    className={`w-full text-left p-2 sm:p-3 rounded-lg flex justify-between items-center transition-all border ${
                      isDisabled
                        ? "bg-gray-50 dark:bg-gray-800/50 opacity-50 cursor-not-allowed border-transparent grayscale"
                        : "bg-white dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-900/20 border-gray-100 dark:border-gray-700 cursor-pointer hover:border-green-200 dark:hover:border-green-800 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 relative">
                        <img
                          src={getShirtUrl(
                            data.teams.find((t) => t.id === p.team) || [],
                            p.element_type === 1
                          )}
                          alt="kit"
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-gray-800 dark:text-gray-100">
                          {p.web_name}
                        </div>
                        <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 flex gap-1">
                          <span>
                            {
                              data.teams.find((t) => t.id === p.team)
                                ?.short_name
                            }
                          </span>
                          <span>•</span>
                          <span>
                            {p.element_type === 1
                              ? "GKP"
                              : p.element_type === 2
                              ? "DEF"
                              : p.element_type === 3
                              ? "MID"
                              : "FWD"}
                          </span>
                          {teamFull && (
                            <span className="text-red-500 dark:text-red-400 font-bold ml-1">
                              (Max 3)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm text-green-700 dark:text-green-400">
                        £{(p.now_cost / 10).toFixed(1)}
                      </div>
                      <div className="text-[10px] text-gray-400 dark:text-gray-500">
                        {p.total_points} pts
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
