import { useEffect, useState, useRef } from "react";
import {
  Save,
  RotateCcw,
  Download,
  XCircle,
  Info,
  AlertTriangle,
  RefreshCw,
  Lock,
  List,
  LayoutGrid,
} from "lucide-react";
import Pitch from "../components/Planner/Pitch";
import PlayerFilters from "../components/Planner/PlayerFilters";
import PlayerDetailModal from "../components/Planner/PlayerDetailModal";
import ImportTeamModal from "../components/Planner/ImportTeamModal";
import Footer from "../components/Footer";
import { useFPLApi } from "../hooks/useFPLApi";
import { SquadListView } from "../components/Planner/SquadListView";
import { getCurrentGameweek } from "../utils/FplUtils";
import GameweekNavigator from "../components/Planner/GameweekNavigator";
import { usePlannerStorage } from "../hooks/usePlannerStorage";
import TeamInfoBanner from "../components/Planner/TeamInfoBanner";
import LoadingSkeleton from "../components/LoadingSkeleton";

export default function Planner({ data }) {
  // --- HOOKS ---
  const {
    baseSquad,
    setBaseSquad,
    plannedSquads,
    setPlannedSquads,
    teamInfo,
    setTeamInfo,
    saveImportedSquad,
    clearStorage,
    isStorageLoaded,
  } = usePlannerStorage();

  const { getShirtUrl, getFixtures, importUserTeam, getUserTeamInfo } =
    useFPLApi();

  // --- LOCAL STATE ---
  const [squad, setSquad] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [activeSortMetric, setActiveSortMetric] = useState("total_points");

  const [isSaved, setIsSaved] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const [substitutionSource, setSubstitutionSource] = useState(null);
  const [transferSource, setTransferSource] = useState(null);

  const [view, setView] = useState("pitch");
  const [positionFilter, setPositionFilter] = useState("all");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [fixtures, setFixtures] = useState([]);

  const [currentActualGw, setCurrentActualGw] = useState(() => {
    const gwEvent = getCurrentGameweek(data?.events);
    return gwEvent ? gwEvent.id : 1;
  });
  const [viewingGw, setViewingGw] = useState(currentActualGw + 1);

  // --- INITIALIZATION ---
  useEffect(() => {
    getFixtures().then((data) => setFixtures(data));
  }, [getFixtures]);

  useEffect(() => {
    if (data?.events) {
      const gwEvent = getCurrentGameweek(data.events);
      if (gwEvent) {
        setCurrentActualGw(gwEvent.id);
        setViewingGw((prev) => (prev === 1 ? gwEvent.id : prev));
      }
    }
  }, [data]);

  useEffect(() => {
    if (isStorageLoaded) {
      if (baseSquad.length > 0 && squad.length === 0) {
        setSquad(baseSquad);
        setIsSaved(true);
      }
    }
  }, [isStorageLoaded, baseSquad]);

  // --- REFRESH DATA LOGIC (Background Sync) ---
  const lastRefreshedId = useRef(null);
  useEffect(() => {
    if (isStorageLoaded && teamInfo?.id) {
      if (lastRefreshedId.current === teamInfo.id) return;
      lastRefreshedId.current = teamInfo.id;

      const refreshTeamStats = async () => {
        try {
          const latestInfo = await getUserTeamInfo(teamInfo.id);
          if (latestInfo) {
            if (
              latestInfo.summary_overall_points !==
                teamInfo.summary_overall_points ||
              latestInfo.summary_overall_rank !== teamInfo.summary_overall_rank
            ) {
              setTeamInfo(latestInfo);
            }
          }
        } catch (err) {
          console.warn("Background refresh failed:", err);
        }
      };
      refreshTeamStats();
    }
  }, [isStorageLoaded, teamInfo?.id, getUserTeamInfo, setTeamInfo]);

  // --- NAVIGATION SNAPSHOT LOGIC ---
  useEffect(() => {
    if (!isSaved) return;

    if (viewingGw === currentActualGw) {
      if (baseSquad.length > 0) setSquad(baseSquad);
      return;
    }

    if (plannedSquads[viewingGw]) {
      setSquad(plannedSquads[viewingGw]);
      return;
    }

    const prevGw = viewingGw - 1;
    const prevSquad =
      prevGw === currentActualGw ? baseSquad : plannedSquads[prevGw];

    if (prevSquad && prevSquad.length > 0) {
      const clonedSquad = JSON.parse(JSON.stringify(prevSquad));
      setSquad(clonedSquad);
      setPlannedSquads((prev) => ({
        ...prev,
        [viewingGw]: clonedSquad,
      }));
    }
  }, [viewingGw, currentActualGw, isSaved, baseSquad]);

  // --- HELPER: Update State Wrapper ---
  const updateSquadState = (newSquad) => {
    setSquad(newSquad);
    if (viewingGw === currentActualGw) {
      setBaseSquad(newSquad);
    } else {
      setPlannedSquads((prev) => ({
        ...prev,
        [viewingGw]: newSquad,
      }));
    }
  };

  // --- NEW: RESTRICTION LOGIC ---
  const ensurePlanningMode = () => {
    if (baseSquad.length === 0) return true; // Manual mode exception

    if (viewingGw === currentActualGw) {
      const confirmSwitch = window.confirm(
        "Modifications are restricted on the Active Squad.\n\nSwitch to Planning Mode (Next GW) to make changes?"
      );
      if (confirmSwitch) {
        setViewingGw(currentActualGw + 1);
        setSelectedPlayer(null);
      }
      return false;
    }
    return true;
  };

  // --- EXISTING HELPERS ---
  const isPositionFull = (elementType) => {
    const count = squad.filter((p) => p.element_type === elementType).length;
    if (elementType === 1) return count >= 2;
    if (elementType === 2) return count >= 5;
    if (elementType === 3) return count >= 5;
    if (elementType === 4) return count >= 3;
    return false;
  };

  const isTeamFull = (teamId, ignorePlayerId = null) => {
    const relevantSquad = ignorePlayerId
      ? squad.filter((p) => p.id !== ignorePlayerId)
      : squad;
    return relevantSquad.filter((p) => p.team === teamId).length >= 3;
  };

  // --- ACTIONS ---
  const addPlayer = (player) => {
    if (!ensurePlanningMode()) return;
    if (squad.length >= 15) return;
    if (isPositionFull(player.element_type)) return;
    if (isTeamFull(player.team)) return;

    const newSquad = [
      ...squad,
      { ...player, starting: true, teams: data.teams },
    ];
    updateSquadState(newSquad);
  };

  const removePlayer = (playerId) => {
    if (!ensurePlanningMode()) return;
    const newSquad = squad.filter((p) => p.id !== playerId);
    updateSquadState(newSquad);
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

  // --- SUBSTITUTION ---
  const isSubstitutionValid = (sourceId, targetId) => {
    const sourceIndex = squad.findIndex((p) => p.id === sourceId);
    const targetIndex = squad.findIndex((p) => p.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1) return false;

    const sourcePlayer = squad[sourceIndex];
    const targetPlayer = squad[targetIndex];

    if (sourcePlayer.element_type === 1 && targetPlayer.element_type !== 1)
      return false;
    if (targetPlayer.element_type === 1 && sourcePlayer.element_type !== 1)
      return false;

    const isSourceStarter = sourceIndex < 11;
    const isTargetStarter = targetIndex < 11;

    if (isSourceStarter === isTargetStarter) return true;

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

  const handleSubstitutionStart = (playerId) => {
    if (!ensurePlanningMode()) return;
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

      updateSquadState(newSquad);
      setSubstitutionSource(null);
      setIsSaved(true);
    } else {
      alert("Invalid substitution! Check formation rules.");
    }
  };

  const handleCancelSubstitution = () => {
    setSubstitutionSource(null);
  };

  // --- TRANSFERS ---
  const handleTransferStart = (playerId) => {
    if (!ensurePlanningMode()) return;
    const playerToTransfer = squad.find((p) => p.id === playerId);
    if (!playerToTransfer) return;
    setTransferSource(playerId);
    setPositionFilter(playerToTransfer.element_type);
    const listElement = document.getElementById("player-list-section");
    if (listElement) listElement.scrollIntoView({ behavior: "smooth" });
  };

  const handleTransferComplete = (newPlayer) => {
    if (!transferSource) return;

    const oldPlayerIndex = squad.findIndex((p) => p.id === transferSource);
    if (oldPlayerIndex === -1) return;
    const oldPlayer = squad[oldPlayerIndex];

    if (oldPlayer.element_type !== newPlayer.element_type) {
      alert("Position mismatch.");
      return;
    }
    if (isTeamFull(newPlayer.team, transferSource)) {
      alert("Team limit reached.");
      return;
    }

    const performSwap = (list) => {
      const newList = [...list];
      const idx = newList.findIndex((p) => p.id === oldPlayer.id);
      if (idx !== -1) {
        newList[idx] = {
          ...newPlayer,
          starting: newList[idx].starting,
          teams: data.teams,
          is_captain: false,
          is_vice_captain: false,
        };
      }
      return newList;
    };

    const updatedVisualSquad = performSwap(squad);
    setSquad(updatedVisualSquad);
    setTransferSource(null);

    setPlannedSquads((prev) => {
      const nextState = { ...prev };
      nextState[viewingGw] = updatedVisualSquad;
      Object.keys(nextState).forEach((gw) => {
        if (parseInt(gw) > viewingGw) {
          nextState[gw] = performSwap(nextState[gw]);
        }
      });
      return nextState;
    });
  };

  const handleCancelTransfer = () => {
    setTransferSource(null);
  };

  // --- SAVE / IMPORT ---
  const handleSaveTeam = () => {
    if (squad.length < 15) {
      alert("You need 15 players to save your team.");
      return;
    }

    const hasCaptain = squad.some((p) => p.is_captain);
    const hasViceCaptain = squad.some((p) => p.is_vice_captain);

    if (!hasCaptain || !hasViceCaptain) {
      let msg = "Cannot save team:\n";
      if (!hasCaptain) msg += "- Missing Captain (C)\n";
      if (!hasViceCaptain) msg += "- Missing Vice-Captain (V)\n";
      alert(msg);
      return;
    }

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
    const organizedSquad = [...startingXI, ...bench];

    setSquad(organizedSquad);
    setIsSaved(true);
    setView("pitch");

    if (viewingGw === currentActualGw) {
      setBaseSquad(organizedSquad);
    } else {
      setPlannedSquads((prev) => ({
        ...prev,
        [viewingGw]: organizedSquad,
      }));
      if (baseSquad.length === 0) {
        setBaseSquad(organizedSquad);
      }
    }
  };

  const handleResetTeam = () => {
    if (window.confirm("Are you sure you want to clear your team?")) {
      setSquad([]);
      setIsSaved(false);
      setSubstitutionSource(null);
      setTransferSource(null);
      clearStorage();
      setViewingGw(currentActualGw + 1);
    }
  };

  const handleImportTeam = async (teamId) => {
    try {
      const currentEvent = data.events.find((e) => e.is_current)?.id || 1;
      const [picks, info] = await Promise.all([
        importUserTeam(teamId, currentEvent),
        getUserTeamInfo(teamId),
      ]);

      if (!picks || picks.length === 0) throw new Error("No players found.");

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

      if (importedSquad.length < 15) throw new Error("Incomplete squad.");

      setSquad(importedSquad);
      setTeamInfo(info);
      setIsSaved(true);
      setView("pitch");
      setViewingGw(currentActualGw);
      saveImportedSquad(importedSquad, info);
    } catch (err) {
      console.error(err);
      alert("Error importing team.");
    }
  };

  // --- CAPTAINCY ---
  const handleSetCaptain = (playerId) => {
    if (!ensurePlanningMode()) return;
    const targetIsCurrentVC = squad.find(
      (p) => p.id === playerId
    )?.is_vice_captain;
    const newSquad = squad.map((p) => {
      if (p.id === playerId)
        return { ...p, is_captain: true, is_vice_captain: false };
      if (p.is_captain)
        return {
          ...p,
          is_captain: false,
          is_vice_captain: targetIsCurrentVC,
        };
      return p;
    });
    updateSquadState(newSquad);
    setSelectedPlayer(null);
  };

  const handleSetViceCaptain = (playerId) => {
    if (!ensurePlanningMode()) return;
    const targetIsCurrentCaptain = squad.find(
      (p) => p.id === playerId
    )?.is_captain;
    const newSquad = squad.map((p) => {
      if (p.id === playerId)
        return { ...p, is_vice_captain: true, is_captain: false };
      if (p.is_vice_captain)
        return {
          ...p,
          is_vice_captain: false,
          is_captain: targetIsCurrentCaptain,
        };
      return p;
    });
    updateSquadState(newSquad);
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

  if (!isStorageLoaded || !data) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="grow p-4 sm:p-6 max-w-7xl mx-auto w-full font-sans dark:text-white">
        {/* --- 1. Manager Info --- */}
        {isSaved && teamInfo && <TeamInfoBanner teamInfo={teamInfo} />}

        {/* --- 2. Gameweek Navigator --- */}
        {isSaved && (
          <div className="sticky top-16 z-30 dark:bg-gray-900/95 bg-transparent py-2 mb-4 -mx-4 px-4 sm:mx-0 sm:px-0 transition-all border-b border-transparent data-[stuck=true]:border-gray-200">
            <GameweekNavigator
              viewingGw={viewingGw}
              currentActualGw={currentActualGw}
              setViewingGw={setViewingGw}
            />
          </div>
        )}

        {/* --- 3. Summary Dashboard --- */}
        {/* Removed 'sticky' class here */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Left: Squad Stats */}
            <div className="flex items-center gap-6 w-full sm:w-auto justify-center sm:justify-start">
              <div className="text-center sm:text-left">
                <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">
                  Squad Size
                </div>
                <div
                  className={`text-2xl font-black ${
                    squad.length === 15
                      ? "text-green-600 dark:text-green-400"
                      : "text-gray-800 dark:text-white"
                  }`}
                >
                  {squad.length}
                  <span className="text-lg text-gray-400 font-medium">/15</span>
                </div>
              </div>
              <div className="h-8 w-px bg-gray-200 dark:bg-gray-700"></div>
              <div className="text-center sm:text-left">
                <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">
                  Bank Value
                </div>
                <div className="text-2xl font-black text-green-600 dark:text-green-400">
                  £{totalCost.toFixed(1)}m
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex flex-wrap justify-center gap-2">
              {/* View Toggle */}
              <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-lg flex items-center">
                <button
                  onClick={() => setView("pitch")}
                  className={`p-2 rounded-md transition-all ${
                    view === "pitch"
                      ? "bg-white dark:bg-gray-600 text-green-600 dark:text-green-400 shadow-sm"
                      : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                  title="Pitch View"
                >
                  <LayoutGrid size={20} />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={`p-2 rounded-md transition-all ${
                    view === "list"
                      ? "bg-white dark:bg-gray-600 text-green-600 dark:text-green-400 shadow-sm"
                      : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                  title="List View"
                >
                  <List size={20} />
                </button>
              </div>

              {/* Reset Button */}
              {squad.length > 0 && (
                <button
                  onClick={handleResetTeam}
                  className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                  title="Reset Team"
                >
                  <RotateCcw size={20} />
                </button>
              )}

              {/* Save Button */}
              {!isSaved && (
                <button
                  onClick={handleSaveTeam}
                  disabled={squad.length < 15}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold shadow-md transition-all ${
                    squad.length === 15
                      ? "bg-green-600 hover:bg-green-700 text-white cursor-pointer hover:-translate-y-0.5"
                      : "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <Save size={18} /> Save Team
                </button>
              )}
            </div>
          </div>
        </div>

        {/* --- Main Content Grid --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 relative items-start">
          {/* LEFT COL: PITCH (Span 8) */}
          <div
            className={`lg:col-span-8 order-1 relative transition-all duration-300 ${
              transferSource
                ? "opacity-40 pointer-events-none grayscale blur-sm"
                : "opacity-100"
            }`}
          >
            {view === "pitch" ? (
              <Pitch
                squad={squad}
                saved={isSaved}
                gameweekId={viewingGw}
                onRemovePlayer={removePlayer}
                onPlaceholderClick={handlePlaceholderClick}
                substitutionSource={substitutionSource}
                onSubstituteComplete={handleSubstitutionComplete}
                isSubstitutionValid={isSubstitutionValid}
                onPlayerSelect={handleSelectedPlayer}
              />
            ) : (
              <SquadListView
                squad={squad}
                saved={isSaved}
                data={data}
                removePlayer={removePlayer}
                getShirtUrl={getShirtUrl}
                onPlayerSelect={handleSelectedPlayer}
                gameweekId={viewingGw}
                substitutionSource={substitutionSource}
                onSubstituteComplete={handleSubstitutionComplete}
                isSubstitutionValid={isSubstitutionValid}
              />
            )}

            {/* Import CTA */}
            {squad.length === 0 && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 px-6 py-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform"
                >
                  <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full text-green-600">
                    <Download size={24} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-gray-900 dark:text-white">
                      Import FPL Team
                    </div>
                    <div className="text-xs text-gray-500">
                      Enter your Team ID to load
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* RIGHT COL: PLAYER SELECTOR (Span 4) */}
          {/* Note: I added sticky here too, but adjusted top to fit below navigator */}
          <div
            id="player-list-section"
            className={`lg:col-span-4 order-2 transition-all duration-300 ${
              substitutionSource
                ? "opacity-40 grayscale pointer-events-none"
                : "opacity-100"
            }`}
          >
            <div
              className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden sticky top-36 border transition-colors duration-300 ${
                transferSource
                  ? "border-amber-500 ring-4 ring-amber-500/20"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              {transferSource && (
                <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-200 px-4 py-3 text-sm font-bold text-center flex items-center justify-center gap-2 border-b border-amber-100 dark:border-amber-800/50">
                  <RefreshCw size={16} className="animate-spin-slow" />
                  Select replacement player
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

              <div className="max-h-150 overflow-y-auto p-2 space-y-1 bg-gray-50/50 dark:bg-gray-900/20">
                {filteredPlayers.map((p) => {
                  // ... (Existing mapping logic for filteredPlayers) ...
                  const posFull = isPositionFull(p.element_type);
                  const teamFull = isTeamFull(p.team, transferSource);
                  const isDisabled = transferSource
                    ? p.element_type !== positionFilter || teamFull
                    : posFull || teamFull || isSaved;

                  const chance = p.chance_of_playing_next_round;
                  const isInjured = chance !== null && chance < 100;
                  const injuryColorClass =
                    chance === 0
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-yellow-50 text-yellow-700 border-yellow-200";

                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        if (transferSource) handleTransferComplete(p);
                        else if (!isDisabled) addPlayer(p);
                      }}
                      disabled={isDisabled}
                      className={`w-full text-left p-2.5 rounded-xl flex justify-between items-center transition-all border group ${
                        isDisabled
                          ? "opacity-40 cursor-not-allowed bg-transparent border-transparent grayscale"
                          : transferSource
                          ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-amber-400 hover:shadow-md cursor-pointer"
                          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-green-500 hover:shadow-md cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 relative shrink-0">
                          <img
                            src={getShirtUrl(
                              data.teams.find((t) => t.id === p.team) || [],
                              p.element_type === 1
                            )}
                            alt="kit"
                            className="object-contain drop-shadow-sm group-hover:scale-110 transition-transform"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <div className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate">
                              {p.web_name}
                            </div>
                            {isInjured && (
                              <div
                                title={p.news}
                                className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold border ${injuryColorClass}`}
                              >
                                <AlertTriangle size={10} />
                                {chance}%
                              </div>
                            )}
                          </div>
                          <div className="text-[10px] text-gray-500 flex items-center gap-1">
                            <span className="uppercase font-bold tracking-wider">
                              {
                                data.teams.find((t) => t.id === p.team)
                                  ?.short_name
                              }
                            </span>
                            <span className="text-gray-300">•</span>
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
                              <span className="text-red-500 font-bold ml-1">
                                (Max 3)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pl-2">
                        <div className="text-right">
                          <div className="font-bold text-sm text-green-600 dark:text-green-400">
                            {getMetricDisplay(p, activeSortMetric)}
                          </div>
                          <div className="text-[9px] uppercase text-gray-400 font-bold">
                            {metricLabels[activeSortMetric] || "Pts"}
                          </div>
                        </div>
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectedPlayer(p);
                          }}
                          className="p-1.5 rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        >
                          <Info size={18} />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Global Action Buttons (Fixed Bottom) */}
        {substitutionSource && (
          <div className="fixed bottom-8 left-0 right-0 z-50 flex justify-center animate-in slide-in-from-bottom-10 fade-in duration-300">
            <button
              onClick={handleCancelSubstitution}
              className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-full shadow-2xl font-bold hover:bg-red-700 border-4 border-white dark:border-gray-900 transform hover:scale-105 transition-all"
            >
              <XCircle size={20} /> Cancel Substitution
            </button>
          </div>
        )}

        {transferSource && (
          <div className="fixed bottom-8 left-0 right-0 z-50 flex justify-center animate-in slide-in-from-bottom-10 fade-in duration-300">
            <button
              onClick={handleCancelTransfer}
              className="flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-full shadow-2xl font-bold hover:bg-amber-700 border-4 border-white dark:border-gray-900 transform hover:scale-105 transition-all"
            >
              <XCircle size={20} /> Cancel Transfer
            </button>
          </div>
        )}

        {/* Modals remain unchanged */}
        {selectedPlayer && (
          <PlayerDetailModal
            player={selectedPlayer}
            fixtures={fixtures}
            onClose={() => setSelectedPlayer(null)}
            onRemove={removePlayer}
            onSubstituteStart={handleSubstitutionStart}
            isSavedState={isSaved}
            inSquad={
              selectedPlayer
                ? squad.some((p) => p.id === selectedPlayer.id)
                : false
            }
            isCaptain={selectedPlayer.is_captain}
            isViceCaptain={selectedPlayer.is_vice_captain}
            onSetCaptain={handleSetCaptain}
            onSetViceCaptain={handleSetViceCaptain}
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
    </div>
  );
}
