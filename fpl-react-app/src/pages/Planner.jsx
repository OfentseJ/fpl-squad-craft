import { useEffect, useState } from "react";
import {
  Users,
  Save,
  RotateCcw,
  Download,
  XCircle,
  Info,
  AlertTriangle,
  RefreshCw, // Added icon for transfer mode
} from "lucide-react";
import Pitch from "../components/Planner/Pitch";
import PlayerFilters from "../components/Planner/PlayerFilters";
import PlayerDetailModal from "../components/Planner/PlayerDetailModal";
import ImportTeamModal from "../components/Planner/ImportTeamModal";
import Footer from "../components/Footer";
import { useFPLApi } from "../hooks/useFplApi";

export default function Planner({ data }) {
  const [squad, setSquad] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [activeSortMetric, setActiveSortMetric] = useState("total_points");

  // State to manage Pre-Save vs Post-Save (Dynamic Formation) modes
  const [isSaved, setIsSaved] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // --- Substitution State ---
  const [substitutionSource, setSubstitutionSource] = useState(null);

  // --- NEW: Transfer State ---
  const [transferSource, setTransferSource] = useState(null);

  const [view, setView] = useState("pitch");
  const [positionFilter, setPositionFilter] = useState("all");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [fixtures, setFixtures] = useState([]);

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

  // --- NEW: Modified isTeamFull to account for transfers ---
  // If we are transferring, we ignore the player currently leaving the squad
  const isTeamFull = (teamId, ignorePlayerId = null) => {
    const relevantSquad = ignorePlayerId
      ? squad.filter((p) => p.id !== ignorePlayerId)
      : squad;
    return relevantSquad.filter((p) => p.team === teamId).length >= 3;
  };

  const addPlayer = (player) => {
    if (squad.length >= 15) return;
    if (isPositionFull(player.element_type)) return;
    if (isTeamFull(player.team)) return;

    setIsSaved(false);
    setSquad([...squad, { ...player, starting: true, teams: data.teams }]);
  };

  const removePlayer = (playerId) => {
    setIsSaved(false);
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

  // --- Validation Logic for Substitutions ---
  const isSubstitutionValid = (sourceId, targetId) => {
    const sourceIndex = squad.findIndex((p) => p.id === sourceId);
    const targetIndex = squad.findIndex((p) => p.id === targetId);

    if (sourceIndex === -1 || targetIndex === -1) return false;

    const sourcePlayer = squad[sourceIndex];
    const targetPlayer = squad[targetIndex];

    // RULE 1: GK can only swap with GK
    if (sourcePlayer.element_type === 1 && targetPlayer.element_type !== 1)
      return false;
    if (targetPlayer.element_type === 1 && sourcePlayer.element_type !== 1)
      return false;

    // If both are Starting XI (indices 0-10) or both are Bench (indices 11-14), swap is always valid
    const isSourceStarter = sourceIndex < 11;
    const isTargetStarter = targetIndex < 11;

    if (isSourceStarter === isTargetStarter) return true;

    // RULE 2: Formation Validation
    const tempSquad = [...squad];
    [tempSquad[sourceIndex], tempSquad[targetIndex]] = [
      tempSquad[targetIndex],
      tempSquad[sourceIndex],
    ];

    const newStarters = tempSquad.slice(0, 11);

    const defCount = newStarters.filter((p) => p.element_type === 2).length;
    const midCount = newStarters.filter((p) => p.element_type === 3).length;
    const fwdCount = newStarters.filter((p) => p.element_type === 4).length;

    if (defCount < 3) return false;
    if (midCount < 2) return false;
    if (fwdCount < 1) return false;

    return true;
  };

  const isSelectedPlayerInSquad = selectedPlayer
    ? squad.some((p) => p.id === selectedPlayer.id)
    : false;

  const handleSubstitutionStart = (playerId) => {
    setSubstitutionSource(playerId);
    setSelectedPlayer(null);
  };

  const handleSubstitutionComplete = (targetId) => {
    if (!substitutionSource) return;

    if (substitutionSource === targetId) {
      setSubstitutionSource(null);
      return;
    }

    if (isSubstitutionValid(substitutionSource, targetId)) {
      const newSquad = [...squad];
      const index1 = newSquad.findIndex((p) => p.id === substitutionSource);
      const index2 = newSquad.findIndex((p) => p.id === targetId);

      [newSquad[index1], newSquad[index2]] = [
        newSquad[index2],
        newSquad[index1],
      ];

      setSquad(newSquad);
      setSubstitutionSource(null);
      setIsSaved(true);
    } else {
      alert(
        "Invalid substitution! Check formation rules (Min 3 DEF, 2 MID, 1 FWD)."
      );
    }
  };

  const handleCancelSubstitution = () => {
    setSubstitutionSource(null);
  };

  // --- NEW: Transfer Handlers ---

  const handleTransferStart = (playerId) => {
    const playerToTransfer = squad.find((p) => p.id === playerId);
    if (!playerToTransfer) return;

    setTransferSource(playerId);

    // 1. Auto-filter the market to the same position
    setPositionFilter(playerToTransfer.element_type);

    // 2. Scroll to the player list to encourage selection
    const listElement = document.getElementById("player-list-section");
    if (listElement) listElement.scrollIntoView({ behavior: "smooth" });
  };

  const handleTransferComplete = (newPlayer) => {
    if (!transferSource) return;

    const oldPlayerIndex = squad.findIndex((p) => p.id === transferSource);
    if (oldPlayerIndex === -1) return;

    const oldPlayer = squad[oldPlayerIndex];

    // Validation 1: Position Check
    // (To keep the pitch logic simple, strictly enforce position matching for now)
    if (oldPlayer.element_type !== newPlayer.element_type) {
      alert(
        `You must replace a ${
          oldPlayer.element_type === 1 ? "Goalkeeper" : "Player"
        } with the same position.`
      );
      return;
    }

    // Validation 2: Team Limit Check (Ignoring the player leaving)
    if (isTeamFull(newPlayer.team, transferSource)) {
      alert("You already have 3 players from this team.");
      return;
    }

    // Perform the Swap
    const newSquad = [...squad];

    newSquad[oldPlayerIndex] = {
      ...newPlayer,
      starting: oldPlayer.starting,
      teams: data.teams,
      is_captain: false,
      is_vice_captain: false,
    };

    setSquad(newSquad);
    setTransferSource(null);
  };

  const handleCancelTransfer = () => {
    setTransferSource(null);
  };

  const handleSaveTeam = () => {
    if (squad.length === 15) {
      const gks = squad.filter((p) => p.element_type === 1);
      const defs = squad.filter((p) => p.element_type === 2);
      const mids = squad.filter((p) => p.element_type === 3);
      const fwds = squad.filter((p) => p.element_type === 4);

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
      setSubstitutionSource(null);
      setTransferSource(null);
    }
  };

  const handleImportTeam = async (teamId) => {
    try {
      const currentEvent = data.events.find((e) => e.is_current)?.id || 1;
      const picks = await importUserTeam(teamId, currentEvent);

      if (!picks || picks.length === 0) {
        throw new Error("No players found for this team ID.");
      }

      const importedSquad = picks
        .map((pick) => {
          const playerDetails = data.elements.find(
            (e) => e.id === pick.element
          );
          if (!playerDetails) return null;
          return {
            ...playerDetails,
            teams: data.teams,
            is_captain: pick.is_captain,
            is_vice_captain: pick.is_vice_captain,
          };
        })
        .filter(Boolean);

      if (importedSquad.length < 15) {
        throw new Error("Could not find all players in database");
      }

      setSquad(importedSquad);
      setIsSaved(true);
      setView("pitch");
    } catch (err) {
      console.error("Import failed inside Planner:", err);
      throw err;
    }
  };

  const handleSetCaptain = (playerId) => {
    const targetIsCurrentVC = squad.find(
      (p) => p.id === playerId
    )?.is_vice_captain;

    const newSquad = squad.map((p) => {
      if (p.id === playerId) {
        return { ...p, is_captain: true, is_vice_captain: false };
      }
      if (p.is_captain) {
        return {
          ...p,
          is_captain: false,
          is_vice_captain: targetIsCurrentVC,
        };
      }
      return p;
    });

    setSquad(newSquad);
    setSelectedPlayer(null);
  };

  const handleSetViceCaptain = (playerId) => {
    const targetIsCurrentCaptain = squad.find(
      (p) => p.id === playerId
    )?.is_captain;

    const newSquad = squad.map((p) => {
      if (p.id === playerId) {
        return { ...p, is_vice_captain: true, is_captain: false };
      }
      if (p.is_vice_captain) {
        return {
          ...p,
          is_vice_captain: false,
          is_captain: targetIsCurrentCaptain,
        };
      }
      return p;
    });

    setSquad(newSquad);
    setSelectedPlayer(null);
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
                  <Save size={18} /> Save
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
          {/* NEW: Dim the pitch if we are in Transfer Mode */}
          <div
            className={`lg:col-span-2 order-1 lg:order-1 relative transition-opacity duration-300 ${
              transferSource
                ? "opacity-50 pointer-events-none grayscale"
                : "opacity-100"
            }`}
          >
            {view === "pitch" ? (
              <Pitch
                squad={squad}
                saved={isSaved}
                onRemovePlayer={removePlayer}
                onPlaceholderClick={handlePlaceholderClick}
                // Substitution props
                substitutionSource={substitutionSource}
                onSubstituteComplete={handleSubstitutionComplete}
                isSubstitutionValid={isSubstitutionValid}
                onPlayerSelect={handleSelectedPlayer}
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
                    {
                      <button
                        onClick={() => removePlayer(p.id)}
                        className="text-red-500 text-sm underline hover:text-red-400"
                      >
                        Remove
                      </button>
                    }
                  </div>
                ))}
              </div>
            )}

            {/* --- IMPORT BUTTON SECTION (Below Pitch) --- */}
            <div className="mt-4 flex justify-center sm:justify-end">
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="group flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all duration-200 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:text-green-700 hover:border-green-300 hover:shadow-md hover:-translate-y-0.5 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-750 dark:hover:text-green-400 dark:hover:border-green-600"
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
            // Apply blur and disable pointer events when subbing (BUT NOT when Transferring)
            className={`lg:col-span-1 order-2 lg:order-2 transition-all duration-300 ${
              substitutionSource
                ? "opacity-40 grayscale pointer-events-none"
                : "opacity-100"
            }`}
          >
            {/* NEW: Visual cue when in transfer mode */}
            <div
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden sticky top-4 border transition-colors duration-300 ${
                transferSource
                  ? "border-amber-500 ring-2 ring-amber-500/30"
                  : "border-gray-100 dark:border-gray-700"
              }`}
            >
              {/* NEW: Transfer Mode Header */}
              {transferSource && (
                <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-4 py-2 text-xs font-bold text-center flex items-center justify-center gap-2">
                  <RefreshCw size={14} className="animate-spin-slow" /> Select a
                  replacement
                </div>
              )}

              <PlayerFilters
                allPlayers={data?.elements}
                squad={squad}
                teams={data?.teams}
                onFilteredPlayersChange={setFilteredPlayers}
                onSortMetricChange={setActiveSortMetric}
                positionFilter={positionFilter}
                onPositionFilterChange={setPositionFilter}
              />

              <div className="max-h-[500px] overflow-y-auto p-2 space-y-1 bg-white dark:bg-gray-800">
                {filteredPlayers.map((p) => {
                  const posFull = isPositionFull(p.element_type);
                  // NEW: Check team full using the transfer exception logic
                  const teamFull = isTeamFull(p.team, transferSource);

                  // NEW: Logic for button state
                  // If Transfer Mode: Disable only if position mismatch or Team limit reached
                  // If Normal Mode: Disable if Position full, Team full, or View is Saved
                  const isDisabled = transferSource
                    ? p.element_type !== positionFilter || teamFull
                    : posFull || teamFull || isSaved;

                  const chance = p.chance_of_playing_next_round;
                  const isInjured = chance !== null && chance < 100;

                  const injuryColorClass =
                    chance === 0
                      ? "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800";

                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        // NEW: Dual functionality based on mode
                        if (transferSource) {
                          handleTransferComplete(p);
                        } else if (!isDisabled) {
                          addPlayer(p);
                        }
                      }}
                      disabled={isDisabled}
                      className={`w-full text-left p-2 sm:p-3 rounded-lg flex justify-between items-center transition-all border ${
                        isDisabled
                          ? "bg-gray-50 dark:bg-gray-800/50 opacity-50 cursor-not-allowed border-transparent grayscale"
                          : transferSource
                          ? "bg-amber-50 dark:bg-amber-900/10 border-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/20 cursor-pointer"
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
                          <div className="flex items-center gap-2">
                            <div className="font-bold text-xs sm:text-sm text-gray-800 dark:text-gray-100">
                              {p.web_name}
                            </div>
                            {isInjured && (
                              <div
                                title={p.news}
                                className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${injuryColorClass}`}
                              >
                                <AlertTriangle size={10} />
                                <span>{chance}%</span>
                              </div>
                            )}
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

        {/* Global Cancel Substitution Button */}
        {substitutionSource && (
          <div className="fixed bottom-10 left-0 right-0 z-50 flex justify-center">
            <button
              onClick={handleCancelSubstitution}
              className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-full shadow-2xl font-bold hover:bg-red-700 border-2 border-white"
            >
              <XCircle size={20} /> Cancel Substitution
            </button>
          </div>
        )}

        {/* NEW: Global Cancel Transfer Button */}
        {transferSource && (
          <div className="fixed bottom-10 left-0 right-0 z-50 flex justify-center animate-bounce-subtle">
            <button
              onClick={handleCancelTransfer}
              className="flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-full shadow-2xl font-bold hover:bg-amber-700 border-2 border-white"
            >
              <XCircle size={20} /> Cancel Transfer
            </button>
          </div>
        )}

        {/* Modals */}
        {selectedPlayer && (
          <PlayerDetailModal
            player={selectedPlayer}
            fixtures={fixtures}
            onClose={() => setSelectedPlayer(null)}
            onRemove={removePlayer}
            onSubstituteStart={handleSubstitutionStart}
            isSavedState={isSaved}
            // Modal Actions
            inSquad={isSelectedPlayerInSquad}
            isCaptain={selectedPlayer.is_captain}
            isViceCaptain={selectedPlayer.is_vice_captain}
            onSetCaptain={handleSetCaptain}
            onSetViceCaptain={handleSetViceCaptain}
            // Transfer Prop
            onTransfer={handleTransferStart}
            isBench={squad.findIndex((p) => p.id === selectedPlayer.id) >= 11}
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
