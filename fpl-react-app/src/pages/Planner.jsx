import { useEffect, useState } from "react";
import { Info, Users, Download, RotateCcw } from "lucide-react";
import Pitch from "../components/Planner/Pitch";
import PlayerFilters from "../components/Planner/PlayerFilters";
import ImportTeamModal from "../components/Planner/ImportTeamModal";
import { useFPLApi } from "../hooks/useFPLApi";
import PlayerDetailModal from "../components/Planner/PlayerDetailModal";
import Footer from "../components/Footer";

export default function Planner({ data }) {
  const [squad, setSquad] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [activeSortMetric, setActiveSortMetric] = useState("total_points");
  const [view, setView] = useState("pitch");
  const [positionFilter, setPositionFilter] = useState("all");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [fixtures, setFixtures] = useState([]);

  // --- State for Mechanics ---
  const [showImportModal, setShowImportModal] = useState(false);
  const [isTeamImported, setIsTeamImported] = useState(false); // Controls Bench Visibility

  const { getShirtUrl, getFixtures, importUserTeam, getBootstrap } =
    useFPLApi();

  useEffect(() => {
    getFixtures().then((data) => setFixtures(data));
  }, []);

  // --- Formation Logic ---
  const calculateFormation = () => {
    const starting = squad.filter((p) => p.starting);

    // If we haven't imported and have an empty or partial squad,
    // force a default 4-4-2 structure for placeholders so the user has slots to click.
    if (!isTeamImported && squad.length === 0) {
      return { name: "Select Players", def: 4, mid: 4, fwd: 2 };
    }

    const startingDef = starting.filter((p) => p.element_type === 2).length;
    const startingMid = starting.filter((p) => p.element_type === 3).length;
    const startingFwd = starting.filter((p) => p.element_type === 4).length;

    // Total defenders, mids, fwds in squad (for placeholder calculation)
    const totalDef = squad.filter((p) => p.element_type === 2).length;
    const totalMid = squad.filter((p) => p.element_type === 3).length;
    const totalFwd = squad.filter((p) => p.element_type === 4).length;

    // Show placeholders up to position limits (5 def, 5 mid, 3 fwd)
    // If manual mode (!isTeamImported), we want to encourage a valid formation,
    // so we ensure enough placeholders exist.
    const def = Math.max(startingDef, Math.min(3, 5 - totalDef));
    const mid = Math.max(startingMid, Math.min(3, 5 - totalMid));
    const fwd = Math.max(startingFwd, Math.min(2, 3 - totalFwd));

    return {
      name:
        starting.length > 0
          ? `${startingDef}-${startingMid}-${startingFwd}`
          : "Custom",
      def,
      mid,
      fwd,
    };
  };

  const formation = calculateFormation();

  // --- Constraints ---
  const isPositionFull = (elementType) => {
    const count = squad.filter((p) => p.element_type === elementType).length;
    if (elementType === 1) return count >= 2;
    if (elementType === 2) return count >= 5;
    if (elementType === 3) return count >= 5;
    if (elementType === 4) return count >= 3;
    return false;
  };

  const isTeamFull = (teamId) => {
    return squad.filter((p) => p.team === teamId).length >= 3;
  };

  // --- Actions ---
  const addPlayer = (player) => {
    if (squad.length >= 15) return;
    if (isPositionFull(player.element_type)) return;
    if (isTeamFull(player.team)) return;

    // Determine if player should start
    // GKP: first one starts, second is bench
    // Outfield: start if we have fewer than 10 outfield starters
    const isGKP = player.element_type === 1;
    const currentGKPCount = squad.filter((p) => p.element_type === 1).length;
    const currentOutfieldStarters = squad.filter(
      (p) => p.starting && p.element_type !== 1
    ).length;

    const shouldStart = isGKP
      ? currentGKPCount === 0
      : currentOutfieldStarters < 10;

    setSquad([
      ...squad,
      { ...player, starting: shouldStart, teams: data.teams },
    ]);

    // Note: We do NOT set isTeamImported(true) here.
    // Manual building keeps bench hidden until user potentially fills squad or triggers it manually (optional).
  };

  const removePlayer = (playerId) => {
    setSquad(squad.filter((p) => p.id !== playerId));
  };

  const handlePlaceholderClick = (positionId) => {
    setPositionFilter(positionId);
    const listElement = document.getElementById("player-list-section");
    if (listElement) listElement.scrollIntoView({ behavior: "smooth" });
  };

  const handleSelectedPlayer = (player) => {
    setSelectedPlayer({ ...player, teams: data.teams });
  };

  const resetSquad = () => {
    setSquad([]);
    setIsTeamImported(false);
  };

  const totalCost = squad.reduce((sum, p) => sum + p.now_cost, 0) / 10;

  const substitutePlayers = (player1Id, player2Id) => {
    const player1 = squad.find((p) => p.id === player1Id);
    const player2 = squad.find((p) => p.id === player2Id);

    // Prevent GKP from swapping with outfield players
    if (!player1 || !player2) return;
    if (player1.element_type === 1 || player2.element_type === 1) {
      // Only allow GKP to swap with GKP
      if (player1.element_type !== player2.element_type) return;
    }

    setSquad(
      squad.map((p) => {
        if (p.id === player1Id) return { ...p, starting: !p.starting };
        if (p.id === player2Id) return { ...p, starting: !p.starting };
        return p;
      })
    );
  };

  const handleImportTeam = async (teamId) => {
    try {
      const bootstrap = await getBootstrap();
      const currentGW = bootstrap.events.find((e) => e.is_current)?.id || 1;
      const picks = await importUserTeam(teamId, currentGW);

      const importedSquad = picks
        .map((pick) => {
          const player = data.elements.find((p) => p.id === pick.element);
          if (!player) return null;
          return {
            ...player,
            starting: pick.multiplier > 0,
            teams: data.teams,
          };
        })
        .filter(Boolean);

      setSquad(importedSquad);
      setIsTeamImported(true);
    } catch (error) {
      console.error("Failed to import team", error);
    }
  };

  // --- Render Helpers ---
  const getMetricDisplay = (player, metric) => {
    if (metric === "now_cost") return `£${(player.now_cost / 10).toFixed(1)}m`;
    if (metric === "selected_by_percent")
      return `${player.selected_by_percent}%`;
    return `${player[metric]} pts`;
  };

  const metricLabels = {
    total_points: "Total Pts",
    event_points: "GW Pts",
    now_cost: "Price",
    selected_by_percent: "Sel %",
    minutes: "Mins",
    goals_scored: "Goals",
    assists: "Assists",
    clean_sheets: "CS",
    form: "Form",
    ict_index: "ICT",
  };

  return (
    <>
      <div className="p-2 sm:p-4 max-w-7xl mx-auto font-sans dark:text-white">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-center flex items-center justify-center gap-2">
          <Users className="w-6 h-6 sm:w-8 sm:h-8" /> Squad Builder
        </h2>

        {/* Summary Banner */}
        <div className="bg-linear-to-r from-slate-800 to-slate-900 text-white p-4 rounded-xl mb-6 shadow-lg border-t-4 border-green-500">
          <div className="grid grid-cols-2 gap-2 text-center">
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
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-4 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Download size={18} />
            Import My Team
          </button>

          {squad.length > 0 && (
            <button
              onClick={resetSquad}
              className="px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-600 dark:text-red-400 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <RotateCcw size={18} />
              Reset
            </button>
          )}
        </div>

        {/* View Toggles */}
        <div className="mb-6">
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
                showBench={isTeamImported} /* Only show bench if Imported */
                onRemovePlayer={removePlayer}
                onPlaceholderClick={handlePlaceholderClick}
                onSubstitutePlayers={substitutePlayers}
              />
            ) : (
              <div className="space-y-2">
                {squad.length === 0 && (
                  <div className="text-center text-gray-400 py-10">
                    No players selected. Click the pitch placeholders or import
                    your team.
                  </div>
                )}
                {squad.map((p) => (
                  <div
                    key={p.id}
                    className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded shadow border-l-4 border-green-500"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          p.starting
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {p.starting ? "XI" : "BENCH"}
                      </span>
                      <span className="font-bold text-gray-800 dark:text-white">
                        {p.web_name}
                      </span>
                    </div>
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
              <PlayerFilters
                allPlayers={data?.elements}
                squad={squad}
                teams={data?.teams}
                onFilteredPlayersChange={setFilteredPlayers}
                onSortMetricChange={setActiveSortMetric}
                positionFilter={positionFilter}
                onPositionFilterChange={setPositionFilter}
              />

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
                      <div className="flex flex-row gap-4 justify-center items-center">
                        <div className="text-right">
                          <div className="font-bold text-sm text-green-700 dark:text-green-400">
                            {getMetricDisplay(p, activeSortMetric)}
                          </div>
                          <div className="text-[10px] text-gray-400 dark:text-gray-500">
                            {metricLabels[activeSortMetric] || "Pts"}
                          </div>
                        </div>
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectedPlayer(p);
                          }}
                        >
                          <Info size={16} className="text-blue-500" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Import Modal */}
        <ImportTeamModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImport={handleImportTeam}
          data={data}
        />

        {selectedPlayer && (
          <PlayerDetailModal
            player={selectedPlayer}
            squad={squad}
            fixtures={fixtures}
            onClose={() => setSelectedPlayer(null)}
            onRemove={removePlayer}
            onSubstitute={substitutePlayers}
            isSquadView={false}
          />
        )}

        <style>{`
          @keyframes slideInRight {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-slideInRight { animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
          .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        `}</style>
      </div>
      <Footer />
    </>
  );
}
