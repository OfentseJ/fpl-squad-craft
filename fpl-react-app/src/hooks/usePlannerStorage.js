import { useState, useEffect } from "react";

const STORAGE_KEY = "fpl_planner_v2";

export function usePlannerStorage() {
  const [baseSquad, setBaseSquad] = useState([]);
  const [plannedSquads, setPlannedSquads] = useState({});
  const [teamInfo, setTeamInfo] = useState(null);
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);

  // LOAD
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.baseSquad && Array.isArray(parsed.baseSquad)) {
          setBaseSquad(parsed.baseSquad);
        }
        if (parsed.plannedSquads) {
          setPlannedSquads(parsed.plannedSquads);
        }
        if (parsed.teamInfo) {
          setTeamInfo(parsed.teamInfo);
        }
      }
    } catch (error) {
      console.error("Failed to load planner data:", error);
    } finally {
      setIsStorageLoaded(true);
    }
  }, []);

  // --- SAVE ---
  useEffect(() => {
    if (isStorageLoaded && baseSquad.length === 15) {
      const payload = {
        baseSquad,
        plannedSquads,
        teamInfo,
        updatedAt: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    }
  }, [baseSquad, plannedSquads, teamInfo, isStorageLoaded]);

  const saveImportedSquad = (newSquad, newTeamInfo) => {
    setBaseSquad(newSquad);
    setPlannedSquads({});
    setTeamInfo(newTeamInfo);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        baseSquad: newSquad,
        plannedSquads: {},
        teamInfo: newTeamInfo,
        updatedAt: Date.now(),
      })
    );
  };

  const clearStorage = () => {
    setBaseSquad([]);
    setPlannedSquads({});
    setTeamInfo(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    baseSquad,
    setBaseSquad,
    plannedSquads,
    setPlannedSquads,
    teamInfo,
    setTeamInfo,
    saveImportedSquad,
    clearStorage,
    isStorageLoaded,
  };
}
