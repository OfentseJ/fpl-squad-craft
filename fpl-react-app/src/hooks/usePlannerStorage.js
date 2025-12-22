// src/hooks/usePlannerStorage.js

import { useState, useEffect } from "react";

const STORAGE_KEY = "fpl_planner_v1";

export function usePlannerStorage() {
  const [baseSquad, setBaseSquad] = useState([]);
  const [plannedSquads, setPlannedSquads] = useState({});
  // 1. NEW STATE
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
        // 2. LOAD INFO
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

  // SAVE
  useEffect(() => {
    if (isStorageLoaded && baseSquad.length > 0) {
      const payload = {
        baseSquad,
        plannedSquads,
        teamInfo, // 3. SAVE INFO
        updatedAt: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    }
  }, [baseSquad, plannedSquads, teamInfo, isStorageLoaded]);

  // ACTION: Import/Reset Logic
  // 4. Update signature to accept info
  const saveImportedSquad = (newSquad, newTeamInfo) => {
    setBaseSquad(newSquad);
    setPlannedSquads({});
    setTeamInfo(newTeamInfo); // Set state

    // Force immediate save
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        baseSquad: newSquad,
        plannedSquads: {},
        teamInfo: newTeamInfo, // Save to storage
        updatedAt: Date.now(),
      })
    );
  };

  const clearStorage = () => {
    setBaseSquad([]);
    setPlannedSquads({});
    setTeamInfo(null); // Clear info
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
