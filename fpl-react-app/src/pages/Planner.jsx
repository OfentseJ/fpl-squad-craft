import { useEffect, useState } from "react";
import { Info, Users, Save, RotateCcw, Download } from "lucide-react";
import Pitch from "../components/Planner/Pitch";
import PlayerFilters from "../components/Planner/PlayerFilters";
import { useFPLApi } from "../hooks/useFPLApi";
import PlayerDetailModal from "../components/Planner/PlayerDetailModal";
import ImportTeamModal from "../components/Planner/ImportTeamModal";
import Footer from "../components/Footer";

export default function Planner({ data }) {
  const [squad, setSquad] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [activeSortMetric, setActiveSortMetric] = useState("total_points");

  // State to manage Pre-Save vs Post-Save (Dynamic Formation) modes
  const [isSaved, setIsSaved] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const [view, setView] = useState("pitch");
  const [positionFilter, setPositionFilter] = useState("all");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [fixtures, setFixtures] = useState([]);

  // Destructure the new importUserTeam hook
  const { getShirtUrl, getFixtures, importUserTeam } = useFPLApi();

  useEffect(() => {
    getFixtures().then((data) => setFixtures(data));
  }, [getFixtures]);

  // Helper: Check if a specific position is full
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

  const addPlayer = (player) => {
    if (squad.length >= 15) return;
    if (isPositionFull(player.element_type)) return;
    if (isTeamFull(player.team)) return;

    setIsSaved(false); // Edit mode
    setSquad([...squad, { ...player, starting: true, teams: data.teams }]);
  };

  const removePlayer = (playerId) => {
    setIsSaved(false); // Edit mode
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

  const totalCost = squad.reduce((sum, p) => sum + p.now_cost, 0) / 10;

  const substitutePlayers = (player1Id, player2Id) => {
    const newSquad = [...squad];
    const index1 = newSquad.findIndex((p) => p.id === player1Id);
    const index2 = newSquad.findIndex((p) => p.id === player2Id);

    if (index1 !== -1 && index2 !== -1) {
      [newSquad[index1], newSquad[index2]] = [
        newSquad[index2],
        newSquad[index1],
      ];
      setSquad(newSquad);
    }
  };

  const handleSaveTeam = () => {
    if (squad.length === 15) {
      // 1. Separate players by position
      const gks = squad.filter((p) => p.element_type === 1);
      const defs = squad.filter((p) => p.element_type === 2);
      const mids = squad.filter((p) => p.element_type === 3);
      const fwds = squad.filter((p) => p.element_type === 4);

      // 2. Construct 4-4-2 Order for display default
      const startingXI = [
        gks[0],
        ...defs.slice(0, 4),
        ...mids.slice(0, 4),
        ...fwds.slice(0, 2),
      ];

      const bench = [gks[1], defs[4], mids[4], fwds[2]];

      setSquad([...startingXI, ...bench]);
      setIsSaved(true);
      setView("pitch");
    }
  };

  const handleResetTeam = () => {
    if (window.confirm("Are you sure you want to clear your team?")) {
      setSquad([]);
      setIsSaved(false);
    }
  };

  // --- UPDATED: Handle Import Logic using useFPLApi ---
  const handleImportTeam = async (teamId) => {
    try {
      // Find current gameweek from data prop
      const currentEvent = data.events.find((e) => e.is_current)?.id || 1;

      // Use the hook to fetch picks
      const picks = await importUserTeam(teamId, currentEvent);

      if (!picks || picks.length === 0) {
        throw new Error("No players found for this team ID.");
      }

      // Map FPL picks (which only have IDs) to full player objects from our data
      // The FPL API returns picks in order (1-15), where 1-11 are starters.
      // This preserves the user's actual formation.
      const importedSquad = picks
        .map((pick) => {
          const playerDetails = data.elements.find(
            (e) => e.id === pick.element
          );
          if (!playerDetails) return null;
          return { ...playerDetails, teams: data.teams }; // Add teams context
        })
        .filter(Boolean); // Remove nulls if any player not found

      if (importedSquad.length < 15) {
        throw new Error("Could not find all players in database");
      }

      setSquad(importedSquad);
      setIsSaved(true); // Imported teams are always treated as "Saved/Complete"
      setView("pitch");
    } catch (err) {
      console.error("Import failed inside Planner:", err);
      // Rethrow so the Modal can catch and display the error message
      throw err;
    }
  };

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
          <div className="flex justify-around items-center text-center">
            <div>
              <div className="text-xl sm:text-2xl font-bold">
                {squad.length}/15
              </div>
              <div className="text-[10px] sm:text-xs text-gray-400 uppercase">
                Selected
              </div>
            </div>

            <div className="flex gap-3">
              {!isSaved && (
                <button
                  onClick={handleSaveTeam}
                  disabled={squad.length < 15}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold shadow-md transition-all ${
                    squad.length === 15
                      ? "bg-green-600 hover:bg-green-500 text-white animate-pulse cursor-pointer"
                      : "bg-gray-600 text-gray-400 cursor-not-allowed opacity-60"
                  }`}
                >
                  <Save size={18} /> Save & Set XI
                </button>
              )}
              {squad.length > 0 && (
                <button
                  onClick={handleResetTeam}
                  className="p-2 bg-gray-700 hover:bg-red-900/50 text-gray-300 hover:text-red-400 rounded-lg transition-colors"
                  title="Reset Team"
                >
                  <RotateCcw size={18} />
                </button>
              )}
            </div>

            <div>
              <div className="text-xl sm:text-2xl font-bold text-green-400">
                £{totalCost.toFixed(1)}m
              </div>
              <div className="text-[10px] sm:text-xs text-gray-400 uppercase">
                Total Value
              </div>
            </div>
          </div>
        </div>

        {/* View Toggles */}
        <div className="mb-6 flex justify-center gap-2">
          <button
            onClick={() => setView("pitch")}
            className={`px-4 py-1.5 text-sm rounded-full font-medium transition-colors ${
              view === "pitch"
                ? "bg-green-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Pitch View
          </button>
          <button
            onClick={() => setView("list")}
            className={`px-4 py-1.5 text-sm rounded-full font-medium transition-colors ${
              view === "list"
                ? "bg-green-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            List View
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COL: PITCH or LIST VIEW */}
          <div className="lg:col-span-2 order-1 lg:order-1">
            {view === "pitch" ? (
              <Pitch
                squad={squad}
                saved={isSaved}
                onRemovePlayer={removePlayer}
                onPlaceholderClick={handlePlaceholderClick}
                onSubstitutePlayers={substitutePlayers}
              />
            ) : (
              <div className="space-y-2">
                {squad.length === 0 && (
                  <div className="text-center text-gray-400 py-10">
                    No players selected. Go to the Pitch view to add players.
                  </div>
                )}
                {squad.map((p) => (
                  <div
                    key={p.id}
                    className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded shadow border-l-4 border-green-500"
                  >
                    <div className="flex items-center gap-3">
                      <div className="font-bold text-gray-800 dark:text-white">
                        {p.web_name}
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                        {p.element_type === 1
                          ? "GKP"
                          : p.element_type === 2
                          ? "DEF"
                          : p.element_type === 3
                          ? "MID"
                          : "FWD"}
                      </span>
                    </div>
                    {!isSaved && (
                      <button
                        onClick={() => removePlayer(p.id)}
                        className="text-red-500 text-sm underline hover:text-red-400"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* --- IMPORT BUTTON SECTION (Below Pitch) --- */}
            <div className="mt-4 flex justify-center sm:justify-end">
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="
      group flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all duration-200
      bg-white text-gray-700 border border-gray-200
      hover:bg-gray-50 hover:text-green-700 hover:border-green-300 hover:shadow-md hover:-translate-y-0.5
      dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700
      dark:hover:bg-gray-750 dark:hover:text-green-400 dark:hover:border-green-600
    "
              >
                <div className="p-1.5 rounded-lg bg-gray-100 group-hover:bg-green-100 dark:bg-gray-700 dark:group-hover:bg-green-900/30 transition-colors">
                  <Download
                    size={16}
                    className="text-gray-500 group-hover:text-green-600 dark:text-gray-400 dark:group-hover:text-green-400"
                  />
                </div>
                <span>Import FPL Team</span>
              </button>
            </div>
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
                  const isDisabled = posFull || teamFull || isSaved;

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

        {/* Modals */}
        {selectedPlayer && (
          <PlayerDetailModal
            player={selectedPlayer}
            squad={squad}
            fixtures={fixtures}
            onClose={() => setSelectedPlayer(null)}
            onRemove={removePlayer}
            onSubstitute={substitutePlayers}
            isSavedState={isSaved}
          />
        )}

        <ImportTeamModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImport={handleImportTeam}
          data={data}
        />
      </div>
      <Footer />
    </>
  );
}
