import { useEffect, useState, useRef } from "react";
import {
  Save,
  RotateCcw,
  Download,
  XCircle,
  Info,
  AlertTriangle,
  RefreshCw,
  List,
  LayoutGrid,
  Edit2,
  Calendar,
  ShieldCheck,
  Target,
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
import LoadingSkeleton from "../components/Skeletons/LoadingSkeleton";
import BankEditModal from "../components/Planner/BankEditModal";
import FDRModal from "../components/Planner/FDRModal";
import TeamValueEditModal from "../components/Planner/TeamValueEditModal";
import CleanSheetModal from "../components/Planner/CleanSheetModal";
import ProjectedGoalsModal from "../components/Planner/ProjectedGoalsModal";

const createPlaceholder = (index, type) => ({
  id: `placeholder-${index}-${Date.now()}`,
  element_type: type,
  web_name: "Empty",
  now_cost: 0,
  team: null,
  is_placeholder: true,
  position_index: index,
});

const generateEmptySquad = () => {
  const positions = [
    1, // 0: GKP (Starter)
    2,
    2,
    2,
    2, // 1-4: DEF (Starters)
    3,
    3,
    3,
    3, // 5-8: MID (Starters)
    4,
    4, // 9-10: FWD (Starters)
    1, // 11: GKP (Bench)
    2, // 12: DEF (Bench)
    3, // 13: MID (Bench)
    4, // 14: FWD (Bench)
  ];
  return positions.map((pos, i) => createPlaceholder(i, pos));
};

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
  const [squad, setSquad] = useState(generateEmptySquad());
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [activeSortMetric, setActiveSortMetric] = useState("total_points");

  const [isSaved, setIsSaved] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const [substitutionSource, setSubstitutionSource] = useState(null);

  const [view, setView] = useState("pitch");
  const [positionFilter, setPositionFilter] = useState("all");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [fixtures, setFixtures] = useState([]);

  const [currentActualGw, setCurrentActualGw] = useState(() => {
    const gwEvent = getCurrentGameweek(data?.events);
    return gwEvent ? gwEvent.id : 1;
  });
  const [viewingGw, setViewingGw] = useState(currentActualGw + 1);

  const [bank, setBank] = useState(() => {
    const saved = localStorage.getItem("fpl_planner_bank");
    return saved !== null ? parseInt(saved, 10) : 1000;
  });

  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isFDRModalOpen, setIsFDRModalOpen] = useState(false);
  const [manualTeamValue, setManualTeamValue] = useState(null);
  const [isTeamValueModalOpen, setIsTeamValueModalOpen] = useState(false);
  const [isCSModalOpen, setIsCSModalOpen] = useState(false);
  const [isPGModalOpen, setIsPGModalOpen] = useState(false);

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

  const isDefaultSquad = (s) =>
    s.length === 15 && s.every((p) => p.is_placeholder);
  useEffect(() => {
    if (!isStorageLoaded) return;
    if (baseSquad.length > 0 && isDefaultSquad(squad)) {
      let safeSquad = [...baseSquad];
      if (safeSquad.length < 15) {
        console.warn("Hydrating legacy squad format...");
        const emptyTemplate = generateEmptySquad();
        safeSquad = emptyTemplate.map((placeholder, i) => {
          return safeSquad[i] || placeholder;
        });
      }

      setSquad(safeSquad);

      const realPlayerCount = safeSquad.filter((p) => !p.is_placeholder).length;
      setIsSaved(realPlayerCount === 15);
    }
  }, [isStorageLoaded, baseSquad]);

  // --- REFRESH DATA LOGIC (Auto-Update Squad & Stats) ---
  const lastRefreshedId = useRef(null);
  useEffect(() => {
    if (isStorageLoaded && teamInfo?.id && data?.events) {
      if (lastRefreshedId.current === `${teamInfo.id}-${currentActualGw}`)
        return;

      const refreshTeamData = async () => {
        lastRefreshedId.current = `${teamInfo.id}-${currentActualGw}`;

        try {
          if (
            teamInfo.current_event &&
            currentActualGw > teamInfo.current_event
          ) {
            console.log("New Gameweek detected! Auto-importing squad...");
            await loadRemoteSquad(teamInfo.id, currentActualGw);
            return;
          }

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

      refreshTeamData();
    }
  }, [
    isStorageLoaded,
    teamInfo,
    currentActualGw,
    getUserTeamInfo,
    setTeamInfo,
    data,
  ]);
  // --- NAVIGATION SNAPSHOT LOGIC ---
  useEffect(() => {
    if (!isSaved) return;
    if (viewingGw === currentActualGw) {
      if (baseSquad.length > 0) {
        setSquad(baseSquad);
      }
      return;
    }

    if (plannedSquads[viewingGw]) {
      const savedData = plannedSquads[viewingGw];

      if (Array.isArray(savedData)) {
        setSquad(savedData);
      } else {
        setSquad(savedData.squad);
        setBank(savedData.bank);
      }
      return;
    }
    let sourceSquad = null;
    let sourceBank = bank;

    for (let i = viewingGw - 1; i >= currentActualGw; i--) {
      if (i === currentActualGw) {
        sourceSquad = baseSquad;
        break;
      }
      if (plannedSquads[i]) {
        const prevData = plannedSquads[i];
        if (Array.isArray(prevData)) {
          sourceSquad = prevData;
        } else {
          sourceSquad = prevData.squad;
          sourceBank = prevData.bank;
        }
        break;
      }
    }

    if (sourceSquad && sourceSquad.length > 0) {
      const clonedSquad = JSON.parse(JSON.stringify(sourceSquad));

      setSquad(clonedSquad);
      setBank(sourceBank);
      setPlannedSquads((prev) => ({
        ...prev,
        [viewingGw]: { squad: clonedSquad, bank: sourceBank },
      }));
    }
  }, [viewingGw, currentActualGw, isSaved, baseSquad]);

  useEffect(() => {
    localStorage.setItem("fpl_planner_bank", bank);
  }, [bank]);

  // --- Update State Wrapper ---
  const updateSquadState = (newSquad, newBank = null) => {
    // 1. Update Local View
    setSquad(newSquad);

    // Use the provided newBank or fall back to current state (which might be stale, so prefer passing it)
    const activeBank = newBank !== null ? newBank : bank;

    // 2. Define the "Source of Truth" for the ripple
    // We compare newSquad against the 'squad' state (which is now the "Old State")
    const oldSquad = squad;

    // 3. Update the Current GW Storage
    if (viewingGw === currentActualGw) {
      setBaseSquad(newSquad);
    }

    setPlannedSquads((prev) => {
      const nextPlanned = { ...prev };

      // Update the CURRENT planned week
      nextPlanned[viewingGw] = {
        squad: newSquad,
        bank: activeBank,
      };

      // 4. THE RIPPLE LOOP
      // Propagate changes to all FUTURE planned gameweeks
      const maxGw = 38;

      // We carry the 'current' bank forward as we ripple
      let runningBank = activeBank;

      for (let gw = viewingGw + 1; gw <= maxGw; gw++) {
        // If this future GW hasn't been initialized yet, stop rippling
        if (!nextPlanned[gw]) break;

        const futureData = nextPlanned[gw];
        const futureSquad = Array.isArray(futureData)
          ? futureData
          : futureData.squad;
        // If the future week has its own bank value, we might need to adjust it relative to our change
        // For simplicity: if we changed bank NOW, we apply the difference to future.
        const oldBank = Array.isArray(futureData)
          ? runningBank
          : futureData.bank;

        // Calculate the difference caused by our current move (e.g., -5.0m or +2.0m)
        const bankDelta = activeBank - bank;

        // Map the future squad based on our new changes
        const updatedFutureSquad = futureSquad.map((futurePlayer, index) => {
          const newPlayer = newSquad[index]; // The player currently in this slot (post-edit)
          const oldPlayer = oldSquad[index]; // The player previously in this slot (pre-edit)

          // CASE A: We swapped positions (Starters/Bench) or Captaincy
          // If the player IDs match, strictly sync the "Status"
          if (futurePlayer.id === newPlayer.id) {
            return {
              ...futurePlayer,
              starting: newPlayer.starting,
              is_captain: newPlayer.is_captain,
              is_vice_captain: newPlayer.is_vice_captain,
              // Keep futurePlayer specific data (like fixtures) intact
            };
          }

          // CASE B: We made a Transfer (ID changed in this slot)
          // If the future slot was identical to the old slot (meaning it was just inheriting),
          // we should ripple the new transfer forward.
          // BUT if the future slot is DIFFERENT from the old slot (meaning user made a transfer in future),
          // we leave it alone.
          const isSlotInherited = futurePlayer.id === oldPlayer.id; // OR both are placeholders

          if (isSlotInherited) {
            // Future was just copying us, so update it to our new reality
            return newPlayer;
          }

          // CASE C: Future slot has diverged (Specific future plan). Keep it.
          return futurePlayer;
        });

        // Update the future week
        nextPlanned[gw] = {
          squad: updatedFutureSquad,
          // Apply the delta to the future bank (preserving future trades)
          bank: oldBank + bankDelta,
        };

        // Update running bank for next iteration if needed
        runningBank = nextPlanned[gw].bank;
      }

      return nextPlanned;
    });
  };

  // --- RESTRICTION LOGIC ---
  const ensurePlanningMode = () => {
    if (baseSquad.length === 0) return true;

    if (viewingGw === currentActualGw) {
      const confirmSwitch = window.confirm(
        "Modifications are restricted on the Active Squad.\n\nSwitch to Planning Mode (Next GW) to make changes?",
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
  const isTeamFull = (teamId, ignorePlayerId = null) => {
    const relevantSquad = ignorePlayerId
      ? squad.filter((p) => p.id !== ignorePlayerId)
      : squad;
    return (
      relevantSquad.filter((p) => !p.is_placeholder && p.team === teamId)
        .length >= 3
    );
  };

  // --- ACTIONS ---
  const addPlayer = (player) => {
    if (!ensurePlanningMode()) return false;
    if (bank - player.now_cost < 0) {
      alert(
        `Not enough money! You need £${((player.now_cost - bank) / 10).toFixed(
          1,
        )}m more.`,
      );
      return false;
    }

    const playersFromSameTeam = squad.filter(
      (p) => !p.is_placeholder && p.team === player.team,
    ).length;

    if (playersFromSameTeam >= 3) {
      const teamName =
        data?.teams?.find((t) => t.id === player.team)?.name || "this team";
      alert(
        `You cannot have more than 3 players from ${teamName}.\nPlease remove a player from ${teamName} first.`,
      );
      return false;
    }

    const emptySlotIndex = squad.findIndex(
      (p) => p.is_placeholder && p.element_type === player.element_type,
    );

    if (emptySlotIndex === -1) {
      const isSquadFull = squad.every((p) => !p.is_placeholder);

      if (isSquadFull) {
        alert(
          "Squad is full! You have reached the maximum of 15 players.\nPlease remove a player to make room.",
        );
      } else {
        const positionName =
          player.element_type === 1
            ? "Goalkeepers"
            : player.element_type === 2
              ? "Defenders"
              : player.element_type === 3
                ? "Midfielders"
                : "Forwards";
        alert(
          `You cannot add more ${positionName}.\nPlease remove a ${
            player.element_type === 1
              ? "GKP"
              : player.element_type === 2
                ? "DEF"
                : player.element_type === 3
                  ? "MID"
                  : "FWD"
          } first.`,
        );
      }
      return false;
    }

    const newSquad = [...squad];
    const isStarter = emptySlotIndex < 11;

    newSquad[emptySlotIndex] = {
      ...player,
      starting: isStarter,
      teams: data.teams,
      is_captain: false,
      is_vice_captain: false,
      is_placeholder: false,
    };
    const newBank = bank - player.now_cost;

    setBank(newBank);
    updateSquadState(newSquad, newBank);
    return true;
  };

  const removePlayer = (playerId) => {
    if (!ensurePlanningMode()) return;
    const playerIndex = squad.findIndex((p) => p.id == playerId);
    if (playerIndex === -1) return;

    const playerToRemove = squad[playerIndex];
    const refund = playerToRemove.selling_price || playerToRemove.now_cost;
    const newBank = bank + refund;
    const placeholder = createPlaceholder(
      playerIndex,
      playerToRemove.element_type,
    );
    const newSquad = [...squad];
    newSquad[playerIndex] = placeholder;

    setBank(newBank);
    updateSquadState(newSquad, newBank);
    setIsSaved(false);
  };

  const handlePlaceholderClick = (positionId) => {
    setPositionFilter(positionId);
    const listElement = document.getElementById("player-list-section");
    if (listElement) listElement.scrollIntoView({ behavior: "smooth" });
  };

  const handleSelectedPlayer = (player) => {
    setSelectedPlayer({ ...player, teams: data.teams });
  };
  // --- CALCULATED VALUES ---
  const calculatedTeamValue = squad.reduce((sum, p) => sum + p.now_cost, 0);
  const activeTeamValue =
    manualTeamValue !== null ? manualTeamValue : calculatedTeamValue;

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

    const currentStarters = squad.slice(0, 11);
    const currentBench = squad.slice(11, 15);

    const benchGK = currentBench.find((p) => p.element_type === 1);
    const outfieldBench = currentBench.filter((p) => p.element_type !== 1);

    const sortedBench = benchGK ? [benchGK, ...outfieldBench] : currentBench;

    const finalOrder = [...currentStarters, ...sortedBench];

    const syncedSquad = finalOrder.map((p, index) => ({
      ...p,
      starting: index < 11,
    }));

    setSquad(syncedSquad);
    setIsSaved(true);
    setView("pitch");

    if (viewingGw === currentActualGw) {
      setBaseSquad(syncedSquad);
    } else {
      setPlannedSquads((prev) => ({
        ...prev,
        [viewingGw]: syncedSquad,
      }));
      if (baseSquad.length === 0) {
        setBaseSquad(syncedSquad);
      }
    }
  };

  const handleResetTeam = () => {
    if (window.confirm("Are you sure you want to clear your team?")) {
      setSquad(generateEmptySquad());
      setIsSaved(false);

      setBank(1000);

      setSubstitutionSource(null);
      clearStorage();
      setViewingGw(currentActualGw + 1);
    }
  };

  // --- REUSABLE IMPORT FUNCTION ---
  const loadRemoteSquad = async (teamId, targetGw) => {
    try {
      const [picks, info] = await Promise.all([
        importUserTeam(teamId, targetGw),
        getUserTeamInfo(teamId),
      ]);

      if (!picks || picks.length === 0) throw new Error("No players found.");

      const organizedSquad = generateEmptySquad();

      picks.forEach((pick, i) => {
        if (i >= 15) return;

        const playerDetails = data.elements.find((e) => e.id === pick.element);
        if (playerDetails) {
          organizedSquad[i] = {
            ...playerDetails,
            teams: data.teams,
            is_captain: pick.is_captain,
            is_vice_captain: pick.is_vice_captain,
            selling_price: pick.selling_price,
            is_placeholder: false,
            starting: i < 11,
          };
        }
      });

      setSquad(organizedSquad);
      setTeamInfo(info);

      setBank(info.last_deadline_bank || 0);

      setIsSaved(true);

      setBaseSquad(organizedSquad);
      saveImportedSquad(organizedSquad, info);

      return true;
    } catch (err) {
      console.error("Auto-update failed:", err);
      return false;
    }
  };

  const handleImportTeam = async (teamId) => {
    const targetGw = data.events.find((e) => e.is_current)?.id || 1;
    const success = await loadRemoteSquad(teamId, targetGw);
    if (success) {
      setViewingGw(targetGw);
    } else {
      alert("Error importing team.");
    }
  };

  // --- CAPTAINCY ---
  const handleSetCaptain = (playerId) => {
    if (!ensurePlanningMode()) return;
    const targetIsCurrentVC = squad.find(
      (p) => p.id === playerId,
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
  };

  const handleSetViceCaptain = (playerId) => {
    if (!ensurePlanningMode()) return;
    const targetIsCurrentCaptain = squad.find(
      (p) => p.id === playerId,
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
  };

  const handleUpdateBank = (newValue) => {
    setBank(newValue);
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

  // Calculate how many REAL players we have
  const realPlayerCount = squad.filter((p) => !p.is_placeholder).length;
  const isSquadEmpty = squad.every((p) => p.is_placeholder);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="grow p-4 sm:p-6 max-w-7xl mx-auto w-full font-sans dark:text-white">
        {/* --- 1. Manager Info --- */}
        {isSaved && teamInfo && <TeamInfoBanner teamInfo={teamInfo} />}

        {/* --- 2. Gameweek Navigator --- */}
        {isSaved && (
          <div className="sticky top-16 z-30 bg-transparent py-2 mb-4 -mx-4 px-4 sm:mx-0 sm:px-0 transition-all border-b border-transparent data-[stuck=true]:border-gray-200">
            <GameweekNavigator
              viewingGw={viewingGw}
              currentActualGw={currentActualGw}
              setViewingGw={setViewingGw}
            />
          </div>
        )}

        {/* --- 3. Summary Dashboard --- */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col xl:flex-row justify-between items-center gap-4">
            {/* Left: Squad Stats  */}
            <div className="w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0">
              <div className="flex items-center gap-6 min-w-max px-2 mx-auto xl:mx-0">
                {/* 1. Squad Size */}
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
                    <span className="text-lg text-gray-400 font-medium">
                      /15
                    </span>
                  </div>
                </div>

                <div className="h-8 w-px bg-gray-200 dark:bg-gray-700"></div>

                {/* 2. Team Value */}
                <div className="text-center sm:text-left">
                  <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">
                    Team Value
                  </div>
                  <button
                    onClick={() => setIsTeamValueModalOpen(true)}
                    className="group flex items-center gap-2 transition-opacity hover:opacity-80"
                    title="Click to edit team value"
                  >
                    <div className="text-2xl font-black text-green-600 dark:text-green-400">
                      {/* Add an asterisk if manually overridden */}
                      {manualTeamValue !== null && (
                        <span className="text-amber-500 mr-1">*</span>
                      )}
                      £{(activeTeamValue / 10).toFixed(1)}m
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded text-gray-500">
                      <Edit2 size={12} />
                    </div>
                  </button>
                </div>

                <div className="h-8 w-px bg-gray-200 dark:bg-gray-700"></div>

                {/* Money In Bank */}
                <div className="text-center sm:text-left">
                  <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">
                    In the bank
                  </div>
                  <button
                    onClick={() => setIsBankModalOpen(true)}
                    className="group flex items-center gap-2 transition-opacity hover:opacity-80"
                    title="Click to edit budget"
                  >
                    <div
                      className={`text-2xl font-black ${
                        bank < 0
                          ? "text-red-500"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      £{(bank / 10).toFixed(1)}m
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded text-gray-500">
                      <Edit2 size={12} />
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Actions (Stacks below on mobile) */}
            <div className="flex flex-wrap justify-center gap-2 w-full xl:w-auto">
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
                  disabled={realPlayerCount < 15}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold shadow-md transition-all ${
                    realPlayerCount === 15
                      ? "bg-green-600 hover:bg-green-700 text-white cursor-pointer hover:-translate-y-0.5"
                      : "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <Save size={18} /> Save
                </button>
              )}
            </div>
          </div>
        </div>

        {/* --- Main Content Grid --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 relative items-start">
          {/* LEFT COL: PITCH (Span 8) */}
          <div
            className={
              "lg:col-span-7 order-1 relative transition-all duration-300 "
            }
          >
            {view === "pitch" ? (
              <Pitch
                squad={squad}
                saved={isSaved}
                gameweekId={viewingGw}
                currentGw={currentActualGw}
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
                allFixtures={fixtures}
              />
            )}

            {/* FDR Button */}
            <div className="mt-8 text-center">
              {/* Import CTA */}
              {isSquadEmpty && (
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 px-6 py-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform"
                >
                  <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full text-green-600">
                    <Download size={20} />
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="font-bold text-gray-900 dark:text-white">
                      Import FPL Team
                    </div>
                    <div className="text-xs text-gray-500">
                      Enter your Team ID to load
                    </div>
                  </div>
                </button>
              )}
              {/* FDR Button */}
              <button
                onClick={() => setIsFDRModalOpen(true)}
                className="inline-flex items-center ml-2 gap-2 bg-white dark:bg-gray-800 px-6 py-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform"
              >
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full text-green-600">
                  <Calendar size={20} />
                </div>
                <div className="text-left hidden sm:block">
                  <div className="font-bold text-gray-900 dark:text-white">
                    FDR
                  </div>
                  <div className="text-xs text-gray-500">
                    Fixture Difficutly Ticker
                  </div>
                </div>
              </button>

              {/* Clean Sheet Odds Button*/}
              <button
                onClick={() => setIsCSModalOpen(true)}
                className="inline-flex items-center ml-2 gap-2 bg-white dark:bg-gray-800 px-6 py-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform"
              >
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full text-green-600">
                  <ShieldCheck size={20} />
                </div>
                <div className="text-left hidden sm:block">
                  <div className="font-bold text-gray-900 dark:text-white">
                    CS Odds
                  </div>
                  <div className="text-xs text-gray-500">Defensive Rank</div>
                </div>
              </button>
              {/* Projected Goals Button*/}
              <button
                onClick={() => setIsPGModalOpen(true)}
                className="inline-flex items-center ml-2 gap-2 bg-white dark:bg-gray-800 px-6 py-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform"
              >
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full text-green-600">
                  <Target size={20} />
                </div>
                <div className="text-left hidden sm:block">
                  <div className="font-bold text-gray-900 dark:text-white">
                    pGoals
                  </div>
                  <div className="text-xs text-gray-500">pGoals Rank</div>
                </div>
              </button>
            </div>
          </div>
          {/* RIGHT COL: PLAYER SELECTOR (Span 4) */}
          <div
            id="player-list-section"
            className={`lg:col-span-5 order-2 transition-all duration-300 ${
              substitutionSource
                ? "opacity-40 grayscale pointer-events-none"
                : "opacity-100"
            }`}
          >
            <div
              className={
                "bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden sticky top-36 border transition-colors duration-300 border-gray-200 dark:border-gray-700"
              }
            >
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
                  const teamFull = isTeamFull(p.team);
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
                        addPlayer(p);
                      }}
                      className={
                        "w-full text-left p-2.5 rounded-xl flex justify-between items-center transition-all border group bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-green-500 hover:shadow-md cursor-pointer"
                      }
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 relative shrink-0">
                          <img
                            src={getShirtUrl(
                              data.teams.find((t) => t.id === p.team) || [],
                              p.element_type === 1,
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
                        <div className="text-right min-w-16">
                          <div className="font-bold text-sm text-gray-900 dark:text-white flex items-center justify-end">
                            <span>£{(p.now_cost / 10).toFixed(1)}m</span>

                            {activeSortMetric !== "now_cost" && (
                              <>
                                <span className="mx-1.5 text-gray-300 dark:text-gray-600 font-light text-lg leading-none">
                                  |
                                </span>

                                <span className="text-green-600 dark:text-green-400">
                                  {p[activeSortMetric]}
                                  {/* Add % only for selection percentage */}
                                  {activeSortMetric === "selected_by_percent" &&
                                    "%"}
                                </span>
                              </>
                            )}
                          </div>

                          {/* Bottom Row: Label (e.g. "Price" or "Form") */}
                          <div className="text-[9px] uppercase text-gray-400 font-bold truncate">
                            {activeSortMetric === "now_cost"
                              ? "Price"
                              : metricLabels[activeSortMetric] ||
                                activeSortMetric.replace("_", " ")}
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
          <div className="fixed bottom-8 left-0 right-0 z-50 flex justify-center ">
            <button
              onClick={handleCancelSubstitution}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full shadow-2xl font-bold hover:bg-blue-700 border-4 border-white dark:border-gray-900 transform hover:scale-105 transition-all"
            >
              <XCircle size={20} /> Cancel Substitution
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
            onAdd={addPlayer}
            onSubstituteStart={handleSubstitutionStart}
            isSavedState={isSaved}
            inSquad={
              selectedPlayer
                ? squad.some((p) => p.id === selectedPlayer.id)
                : false
            }
            isCaptain={
              squad.find((p) => p.id === selectedPlayer.id)?.is_captain
            }
            isViceCaptain={
              squad.find((p) => p.id === selectedPlayer.id)?.is_vice_captain
            }
            onSetCaptain={handleSetCaptain}
            onSetViceCaptain={handleSetViceCaptain}
            isBench={squad.findIndex((p) => p.id === selectedPlayer.id) >= 11}
          />
        )}

        <ImportTeamModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImport={handleImportTeam}
          data={data}
        />
        <FDRModal
          isOpen={isFDRModalOpen}
          onClose={() => setIsFDRModalOpen(false)}
          teams={data?.teams}
          fixtures={fixtures}
          startGw={viewingGw}
        />
        <CleanSheetModal
          isOpen={isCSModalOpen}
          onClose={() => setIsCSModalOpen(false)}
          teams={data?.teams}
          fixtures={fixtures}
          startGw={viewingGw}
        />
        <ProjectedGoalsModal
          isOpen={isPGModalOpen}
          onClose={() => setIsPGModalOpen(false)}
          teams={data?.teams}
          fixtures={fixtures}
          startGw={viewingGw}
        />
        <TeamValueEditModal
          isOpen={isTeamValueModalOpen}
          onClose={() => setIsTeamValueModalOpen(false)}
          currentValue={activeTeamValue}
          onSave={setManualTeamValue}
          onReset={() => setManualTeamValue(null)}
          isManual={manualTeamValue !== null}
        />
        <BankEditModal
          isOpen={isBankModalOpen}
          onClose={() => setIsBankModalOpen(false)}
          currentBank={bank}
          onSave={handleUpdateBank}
        />
      </div>
      <Footer />
    </div>
  );
}
