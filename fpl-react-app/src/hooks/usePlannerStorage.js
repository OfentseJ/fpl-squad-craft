import { useEffect, useState } from "react";

const STORAGE_KEY = "fpl_planner_v1";

export function usePlannerStorage() {
  const [baseSquad, setBaseSquad] = useState([]);
  const [plannedSquads, setPlannedSquads] = useState({});
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);

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
      }
    } catch (error) {
      console.error("Failed to load planner data from storage:", error);
    } finally {
      setIsStorageLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isStorageLoaded && baseSquad.length > 0) {
      const payload = {
        baseSquad,
        plannedSquads,
        updatedAt: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    }
  }, [baseSquad, plannedSquads, isStorageLoaded]);

  const saveImportedSquad = (newSquad) => {
    setBaseSquad(newSquad);
    setPlannedSquads({});
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        baseSquad: newSquad,
        plannedSquads: {},
        updatedAt: Date.now(),
      })
    );
  };

  const clearStorage = () => {
    setBaseSquad([]);
    setPlannedSquads({});
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    baseSquad,
    setBaseSquad,
    plannedSquads,
    setPlannedSquads,
    saveImportedSquad,
    clearStorage,
    isStorageLoaded,
  };
}
